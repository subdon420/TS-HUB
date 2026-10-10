import TestRun from '../models/TestRun.js';
import TestCase from '../models/TestCase.js';
import Project from '../models/Project.js';
import Bug from '../models/Bug.js';
import ActivityLog from '../models/ActivityLog.js';

export const getRuns = async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = {};
    if (projectId) {
      filter.project = projectId;
    } else if (req.user?.workspace) {
      const workspaceProjects = await Project.find({ workspace: req.user.workspace }).select('_id');
      filter.project = { $in: workspaceProjects.map(p => p._id) };
    }

    const runs = await TestRun.find(filter)
      .populate('project', 'name key')
      .populate('executedBy', 'name email role avatar')
      .populate('suite', 'title')
      .populate('results.testCase', 'key title expectedOutcome')
      .populate('results.createdBug', 'key title severity status')
      .sort({ createdAt: -1 });

    res.json(runs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRunById = async (req, res) => {
  try {
    const run = await TestRun.findById(req.params.id)
      .populate('project', 'name key')
      .populate('executedBy', 'name email role avatar')
      .populate('suite', 'title')
      .populate('results.testCase')
      .populate('results.createdBug', 'key title severity status');
    if (!run) return res.status(404).json({ message: 'Test run not found' });
    res.json(run);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const startRun = async (req, res) => {
  try {
    if (req.user.role === 'developer') {
      return res.status(403).json({ message: 'Developers have View-Only access to test execution' });
    }

    const { projectId, suiteId, title, environment = 'Staging Environment' } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const caseFilter = { project: projectId };
    if (suiteId) caseFilter.suite = suiteId;

    const cases = await TestCase.find(caseFilter);
    if (cases.length === 0) {
      return res.status(400).json({ message: 'No test cases available in this selection' });
    }

    const runCount = await TestRun.countDocuments({ project: projectId });

    const run = await TestRun.create({
      title: title || `Test Execution Cycle #${runCount + 1}`,
      runNumber: runCount + 1,
      project: projectId,
      suite: suiteId || undefined,
      executedBy: req.user._id,
      environment,
      status: 'In Progress',
      totalCases: cases.length,
      results: cases.map(c => ({
        testCase: c._id,
        status: 'Untested',
      })),
    });

    await ActivityLog.create({
      project: projectId,
      user: req.user._id,
      userRole: req.user.role,
      action: 'STARTED_TEST_RUN',
      entityType: 'testRun',
      entityId: run._id.toString(),
      entityTitle: run.title,
      message: `${req.user.name} initiated test execution cycle "${run.title}" (${cases.length} cases)`,
    });

    const populatedRun = await TestRun.findById(run._id)
      .populate('executedBy', 'name email role avatar')
      .populate('results.testCase');

    res.status(201).json(populatedRun);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recordCaseResult = async (req, res) => {
  try {
    if (req.user.role === 'developer') {
      return res.status(403).json({ message: 'Developers cannot mark test results' });
    }

    const { runId } = req.params;
    const { testCaseId, status, notes, autoBug } = req.body;

    const run = await TestRun.findById(runId);
    if (!run) return res.status(404).json({ message: 'Test run not found' });

    const resultIndex = run.results.findIndex(r => r.testCase.toString() === testCaseId);
    if (resultIndex === -1) {
      return res.status(404).json({ message: 'Test case not part of this run' });
    }

    let createdBug = null;

    // Auto-Bug logging on Failure (Feature from Section 4.5)
    if (status === 'Fail' && autoBug) {
      const testCase = await TestCase.findById(testCaseId);
      const project = await Project.findById(run.project);
      const bugCount = await Bug.countDocuments({ project: run.project });
      const bugKey = `${project.key}-BUG-${101 + bugCount}`;

      const generatedSteps = testCase.steps && testCase.steps.length > 0
        ? testCase.steps.map(s => `${s.stepNumber}. ${s.action} -> Expected: ${s.expectedOutcome}`).join('\n')
        : '1. Execute test case steps\n2. Replicate failed condition';

      createdBug = await Bug.create({
        key: bugKey,
        title: autoBug.title || `[FAILED TC] ${testCase.title}`,
        description: autoBug.description || `Auto-logged bug from test run failure in ${run.title}`,
        project: run.project,
        severity: autoBug.severity || 'High',
        priority: autoBug.priority || 'P1',
        reproductionSteps: generatedSteps,
        expectedBehavior: testCase.expectedOutcome,
        actualBehavior: notes || 'Test case step assertion failed during execution.',
        linkedTestCase: testCase._id,
        reporter: req.user._id,
        status: 'Open',
      });

      // Link bug in test case
      testCase.linkedBugs.push(createdBug._id);
      await testCase.save();

      await ActivityLog.create({
        project: run.project,
        user: req.user._id,
        userRole: req.user.role,
        action: 'AUTO_BUG_CREATED',
        entityType: 'bug',
        entityId: createdBug._id.toString(),
        entityTitle: createdBug.title,
        message: `Auto-logged bug [${createdBug.key}] from failed test case "${testCase.title}"`,
      });
    }

    // Update result item
    run.results[resultIndex].status = status;
    run.results[resultIndex].notes = notes || '';
    run.results[resultIndex].executedAt = new Date();
    if (createdBug) {
      run.results[resultIndex].createdBug = createdBug._id;
    }

    // Recompute counters
    run.passedCount = run.results.filter(r => r.status === 'Pass').length;
    run.failedCount = run.results.filter(r => r.status === 'Fail').length;
    run.blockedCount = run.results.filter(r => r.status === 'Blocked').length;
    run.skippedCount = run.results.filter(r => r.status === 'Skipped').length;

    // Also update TestCase's lastExecutionStatus
    await TestCase.findByIdAndUpdate(testCaseId, { lastExecutionStatus: status });

    // If all cases are tested, mark run as Completed
    const untested = run.results.filter(r => r.status === 'Untested').length;
    if (untested === 0) {
      run.status = 'Completed';
      run.completedAt = new Date();
    }

    await run.save();

    const updatedRun = await TestRun.findById(run._id)
      .populate('executedBy', 'name email role avatar')
      .populate('results.testCase', 'key title expectedOutcome steps')
      .populate('results.createdBug', 'key title severity status');

    const io = req.app.get('io');
    if (io) {
      io.to(run.project.toString()).emit('run:updated', updatedRun);
      if (run.status === 'Completed') {
        io.emit('activity:feed', {
          type: 'RUN_COMPLETED',
          message: `${req.user.name} completed test run "${run.title}" (${run.passedCount} passed, ${run.failedCount} failed)`,
          time: new Date(),
        });
      }
    }

    res.json({ run: updatedRun, createdBug });
  } catch (error) {
    console.error('Error recording case result:', error);
    res.status(500).json({ message: error.message });
  }
};

