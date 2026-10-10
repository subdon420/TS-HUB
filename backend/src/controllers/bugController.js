import Bug from '../models/Bug.js';
import Project from '../models/Project.js';
import ActivityLog from '../models/ActivityLog.js';
import Comment from '../models/Comment.js';

export const getBugs = async (req, res) => {
  try {
    const { projectId, status, severity, priority, assigneeId } = req.query;
    const filter = {};

    if (projectId) filter.project = projectId;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (priority) filter.priority = priority;
    if (assigneeId) filter.assignee = assigneeId;

    const bugs = await Bug.find(filter)
      .populate('project', 'name key')
      .populate('reporter', 'name email role avatar')
      .populate('assignee', 'name email role avatar')
      .populate('verifiedBy', 'name email role avatar')
      .populate('linkedTestCase', 'key title')
      .sort({ createdAt: -1 });

    res.json(bugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate('project', 'name key')
      .populate('reporter', 'name email role avatar')
      .populate('assignee', 'name email role avatar')
      .populate('verifiedBy', 'name email role avatar')
      .populate('linkedTestCase', 'key title');

    if (!bug) return res.status(404).json({ message: 'Bug not found' });

    const comments = await Comment.find({ entityId: bug._id, entityType: 'bug' })
      .populate('author', 'name email role avatar')
      .sort({ createdAt: 1 });

    res.json({ bug, comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBug = async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      severity = 'Medium',
      priority = 'P2',
      environment,
      reproductionSteps,
      expectedBehavior,
      actualBehavior,
      linkedTestCaseId,
      status = 'Open'
    } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Generate readable Bug Key like PRJ-BUG-101
    const count = await Bug.countDocuments({ project: projectId });
    const bugKey = `${project.key}-BUG-${101 + count}`;

    const bug = await Bug.create({
      key: bugKey,
      title,
      description,
      project: projectId,
      severity,
      priority,
      environment: environment || {
        os: 'Windows 11',
        browser: 'Chrome 128',
        device: 'Desktop',
        buildVersion: 'v1.4.2-staging'
      },
      reproductionSteps,
      expectedBehavior,
      actualBehavior,
      linkedTestCase: linkedTestCaseId || undefined,
      reporter: req.user._id,
      status,
    });

    const populatedBug = await Bug.findById(bug._id)
      .populate('project', 'name key')
      .populate('reporter', 'name email role avatar');

    await ActivityLog.create({
      project: projectId,
      user: req.user._id,
      userRole: req.user.role,
      action: 'LOGGED_BUG',
      entityType: 'bug',
      entityId: bug._id.toString(),
      entityTitle: bug.title,
      message: `${req.user.name} logged bug [${bug.key}] "${bug.title}" (${bug.severity})`,
      meta: { severity: bug.severity, priority: bug.priority },
    });

    // Notify via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(projectId.toString()).emit('bug:created', populatedBug);
      io.emit('activity:feed', {
        type: 'BUG_CREATED',
        message: `${req.user.name} reported [${bug.key}] ${bug.title}`,
        time: new Date(),
      });
    }

    res.status(201).json(populatedBug);
  } catch (error) {
    console.error('Error creating bug:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateBugStatus = async (req, res) => {
  try {
    const { status, resolutionNotes, gitPrLink, commitHash, verificationNotes } = req.body;
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug not found' });

    const userRole = req.user.role;
    const oldStatus = bug.status;

    // RBAC Rules from Product Spec Section 2:
    // - Change Bug Status to 'In Progress' / 'Ready for QA' (Fixed): QA cannot change to these, Dev and Admin can.
    // - Verify Fix & Close / Re-open Bug: Dev cannot Verify/Close or Reopen, QA and Admin can.
    
    if (['In Progress', 'Ready for QA'].includes(status)) {
      if (userRole === 'tester') {
        return res.status(403).json({
          message: 'Testers cannot move bugs to In Progress or Ready for QA. This action belongs to Developers.'
        });
      }
    }

    if (['Verified & Closed', 'Reopened'].includes(status)) {
      if (userRole === 'developer') {
        return res.status(403).json({
          message: 'Developers cannot close or reopen verified bugs. This action belongs to QA Testers.'
        });
      }
    }

    bug.status = status;

    if (status === 'Ready for QA') {
      bug.resolvedAt = new Date();
      if (resolutionNotes) bug.resolutionNotes = resolutionNotes;
      if (gitPrLink) bug.gitPrLink = gitPrLink;
      if (commitHash) bug.commitHash = commitHash;
      if (!bug.assignee) bug.assignee = req.user._id;
    }

    if (status === 'Verified & Closed') {
      bug.verifiedBy = req.user._id;
      bug.verifiedAt = new Date();
      if (verificationNotes) bug.verificationNotes = verificationNotes;
    }

    if (status === 'Reopened') {
      bug.verifiedBy = req.user._id;
      bug.verifiedAt = new Date();
      if (verificationNotes) bug.verificationNotes = verificationNotes;
    }

    await bug.save();

    const updatedBug = await Bug.findById(bug._id)
      .populate('project', 'name key')
      .populate('reporter', 'name email role avatar')
      .populate('assignee', 'name email role avatar')
      .populate('verifiedBy', 'name email role avatar');

    await ActivityLog.create({
      project: bug.project,
      user: req.user._id,
      userRole: req.user.role,
      action: 'STATUS_TRANSITION',
      entityType: 'bug',
      entityId: bug._id.toString(),
      entityTitle: bug.title,
      message: `${req.user.name} transitioned [${bug.key}] from "${oldStatus}" to "${status}"`,
      meta: { oldStatus, newStatus: status, gitPrLink: bug.gitPrLink },
    });

    // Notify via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(bug.project.toString()).emit('bug:updated', updatedBug);
      io.emit('activity:feed', {
        type: 'STATUS_CHANGED',
        message: `${req.user.name} moved [${bug.key}] to "${status}"`,
        time: new Date(),
        status,
      });
    }

    res.json(updatedBug);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: error.message });
  }
};

export const claimBug = async (req, res) => {
  try {
    // Developers can claim bugs
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug not found' });

    bug.assignee = req.user._id;
    if (bug.status === 'Open' || bug.status === 'Draft' || bug.status === 'Reopened') {
      bug.status = 'In Progress';
    }
    await bug.save();

    const updated = await Bug.findById(bug._id)
      .populate('project', 'name key')
      .populate('reporter', 'name email role avatar')
      .populate('assignee', 'name email role avatar');

    await ActivityLog.create({
      project: bug.project,
      user: req.user._id,
      userRole: req.user.role,
      action: 'CLAIMED_BUG',
      entityType: 'bug',
      entityId: bug._id.toString(),
      entityTitle: bug.title,
      message: `${req.user.name} claimed [${bug.key}] "${bug.title}" for resolution`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(bug.project.toString()).emit('bug:updated', updated);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { content, codeSnippet, language } = req.body;
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug not found' });

    const comment = await Comment.create({
      entityType: 'bug',
      entityId: bug._id,
      entityTypeModel: 'Bug',
      author: req.user._id,
      content,
      codeSnippet: codeSnippet ? {
        language: language || 'json',
        code: codeSnippet,
      } : undefined,
    });

    const populated = await Comment.findById(comment._id)
      .populate('author', 'name email role avatar');

    await ActivityLog.create({
      project: bug.project,
      user: req.user._id,
      userRole: req.user.role,
      action: 'COMMENT_ADDED',
      entityType: 'bug',
      entityId: bug._id.toString(),
      entityTitle: bug.title,
      message: `${req.user.name} commented on [${bug.key}]`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(bug.project.toString()).emit('comment:added', populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const attachFiles = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug not found' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const newAttachments = req.files.map(file => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    }));

    bug.attachments.push(...newAttachments);
    await bug.save();

    res.json(bug.attachments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

