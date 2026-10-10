import Bug from '../models/Bug.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';

export const handleGitWebhook = async (req, res) => {
  try {
    // Accepts webhook payload simulating GitHub/GitLab PR merge or push event
    // E.g.: { pull_request: { title: "Fixes PRJ-BUG-101 payment failure", merged: true, html_url: "https://github.com/testers-home/repo/pull/42" }, sender: { login: "dev-sam" } }
    // Or simplified body: { bugKey: "PRJ-BUG-101", prUrl: "https://github.com/...", commitHash: "7a8bc9f", devEmail: "..." }

    const { bugKey, prUrl, commitHash, pull_request, action } = req.body;

    let targetKey = bugKey;
    let url = prUrl || pull_request?.html_url || 'https://github.com/org/repo/pull/42';
    let commit = commitHash || 'c8f901a';

    // If payload contains PR title like "Fixes PRJ-BUG-101 ..."
    if (!targetKey && pull_request?.title) {
      const match = pull_request.title.match(/([A-Z0-9]+-BUG-\d+)/i);
      if (match) {
        targetKey = match[1].toUpperCase();
      }
    }

    if (!targetKey) {
      return res.status(400).json({ message: 'No referenced bug key found in webhook payload' });
    }

    const bug = await Bug.findOne({ key: targetKey.toUpperCase() });
    if (!bug) {
      return res.status(404).json({ message: `Bug with key ${targetKey} not found` });
    }

    // Find developer user or system bot
    let devUser = await User.findOne({ role: 'developer' });
    if (!devUser) devUser = await User.findOne();

    const previousStatus = bug.status;
    bug.status = 'Ready for QA';
    bug.gitPrLink = url;
    bug.commitHash = commit;
    bug.resolvedAt = new Date();
    bug.resolutionNotes = `Automated GitHub Sync: PR merged via webhook referencing ticket (${url})`;
    if (!bug.assignee && devUser) bug.assignee = devUser._id;
    await bug.save();

    const updatedBug = await Bug.findById(bug._id)
      .populate('project', 'name key')
      .populate('assignee', 'name email role avatar')
      .populate('reporter', 'name email role avatar');

    await ActivityLog.create({
      project: bug.project,
      user: devUser._id,
      userRole: 'developer',
      action: 'GIT_WEBHOOK_MERGED',
      entityType: 'bug',
      entityId: bug._id.toString(),
      entityTitle: bug.title,
      message: `Git Webhook Sync: PR merged referencing [${bug.key}]. Status auto-updated to "Ready for QA"`,
      meta: { gitPrLink: url, commitHash: commit, previousStatus },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(bug.project.toString()).emit('bug:updated', updatedBug);
      io.emit('activity:feed', {
        type: 'GIT_SYNC_TRIGGERED',
        message: `GitHub Webhook: [${bug.key}] PR merged -> Moved to Ready for QA`,
        time: new Date(),
      });
    }

    res.json({
      success: true,
      message: `Successfully synced PR for ${bug.key}. Status transitioned from "${previousStatus}" to "Ready for QA"`,
      bug: updatedBug,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: error.message });
  }
};

