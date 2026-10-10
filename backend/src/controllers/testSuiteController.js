import TestSuite from '../models/TestSuite.js';
import TestCase from '../models/TestCase.js';
import Project from '../models/Project.js';
import ActivityLog from '../models/ActivityLog.js';

export const getSuites = async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = {};
    if (projectId) {
      filter.project = projectId;
    } else if (req.user?.workspace) {
      const workspaceProjects = await Project.find({ workspace: req.user.workspace }).select('_id');
      filter.project = { $in: workspaceProjects.map(p => p._id) };
    }

    const suites = await TestSuite.find(filter)
      .populate('project', 'name key')
      .populate('creator', 'name email role')
      .sort({ createdAt: 1 });

    const suitesWithCases = await Promise.all(
      suites.map(async (suite) => {
        const cases = await TestCase.find({ suite: suite._id })
          .populate('linkedBugs', 'key title status severity')
          .sort({ key: 1 });
        return {
          ...suite.toObject(),
          testCases: cases,
          totalCases: cases.length,
          passedCases: cases.filter(c => c.lastExecutionStatus === 'Pass').length,
          failedCases: cases.filter(c => c.lastExecutionStatus === 'Fail').length,
        };
      })
    );

    res.json(suitesWithCases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSuite = async (req, res) => {
  try {
    if (req.user.role === 'developer') {
      return res.status(403).json({ message: 'Developers have View-Only access to test suites' });
    }

    const { title, description, projectId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const suite = await TestSuite.create({
      title,
      description,
      project: projectId,
      creator: req.user._id,
    });

    await ActivityLog.create({
      project: projectId,
      user: req.user._id,
      userRole: req.user.role,
      action: 'CREATED_TEST_SUITE',
      entityType: 'testSuite',
      entityId: suite._id.toString(),
      entityTitle: suite.title,
      message: `${req.user.name} created test suite "${suite.title}"`,
    });

    res.status(201).json(suite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTestCase = async (req, res) => {
  try {
    if (req.user.role === 'developer') {
      return res.status(403).json({ message: 'Developers have View-Only access to test cases' });
    }

    const {
      suiteId,
      projectId,
      title,
      preconditions,
      steps,
      testData,
      expectedOutcome,
      severity = 'Medium',
    } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const caseCount = await TestCase.countDocuments({ project: projectId });
    const key = `${project.key}-TC-${201 + caseCount}`;

    const testCase = await TestCase.create({
      key,
      suite: suiteId,
      project: projectId,
      title,
      preconditions,
      steps: steps || [
        { stepNumber: 1, action: 'Perform action', expectedOutcome: 'Expected outcome' }
      ],
      testData,
      expectedOutcome,
      severity,
      creator: req.user._id,
    });

    await ActivityLog.create({
      project: projectId,
      user: req.user._id,
      userRole: req.user.role,
      action: 'CREATED_TEST_CASE',
      entityType: 'testCase',
      entityId: testCase._id.toString(),
      entityTitle: testCase.title,
      message: `${req.user.name} defined test case [${testCase.key}] "${testCase.title}"`,
    });

    const populatedCase = await TestCase.findById(testCase._id).populate('suite', 'title');
    res.status(201).json(populatedCase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTestCase = async (req, res) => {
  try {
    if (req.user.role === 'developer') {
      return res.status(403).json({ message: 'Developers have View-Only access to test cases' });
    }

    const testCase = await TestCase.findById(req.params.id);
    if (!testCase) return res.status(404).json({ message: 'Test case not found' });

    Object.assign(testCase, req.body);
    await testCase.save();

    res.json(testCase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

