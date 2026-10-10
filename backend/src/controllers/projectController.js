import Project from '../models/Project.js';
import Bug from '../models/Bug.js';
import TestSuite from '../models/TestSuite.js';
import TestCase from '../models/TestCase.js';
import TestRun from '../models/TestRun.js';
import ActivityLog from '../models/ActivityLog.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ workspace: req.user.workspace })
      .populate('owner', 'name email role avatar')
      .populate('members', 'name email role avatar')
      .sort({ updatedAt: -1 });

    // Compute live dashboard metrics for each project
    const projectSummaries = await Promise.all(
      projects.map(async (project) => {
        const bugs = await Bug.find({ project: project._id });
        const suites = await TestSuite.find({ project: project._id });
        const cases = await TestCase.find({ project: project._id });
        const recentRuns = await TestRun.find({ project: project._id }).sort({ createdAt: -1 }).limit(5);

        const openBugs = bugs.filter(b => !['Verified & Closed'].includes(b.status));
        const criticalBugs = bugs.filter(b => b.severity === 'Critical' && b.status !== 'Verified & Closed').length;
        const highBugs = bugs.filter(b => b.severity === 'High' && b.status !== 'Verified & Closed').length;
        const mediumBugs = bugs.filter(b => b.severity === 'Medium' && b.status !== 'Verified & Closed').length;
        const lowBugs = bugs.filter(b => b.severity === 'Low' && b.status !== 'Verified & Closed').length;
        const readyForQaBugs = bugs.filter(b => b.status === 'Ready for QA').length;
        const inProgressBugs = bugs.filter(b => b.status === 'In Progress').length;

        // Health Score calculation: 100 base minus penalty for critical (-15) and high (-8) open bugs
        const calculatedHealth = Math.max(10, Math.min(100, Math.round(100 - (criticalBugs * 15) - (highBugs * 8) - (mediumBugs * 2))));

        // Suite completion percentage based on passing test cases
        const totalCasesCount = cases.length;
        const passedCasesCount = cases.filter(c => c.lastExecutionStatus === 'Pass').length;
        const completionRate = totalCasesCount > 0 ? Math.round((passedCasesCount / totalCasesCount) * 100) : 0;

        return {
          ...project.toObject(),
          healthScore: calculatedHealth,
          stats: {
            totalBugs: bugs.length,
            openBugsCount: openBugs.length,
            criticalBugs,
            highBugs,
            mediumBugs,
            lowBugs,
            readyForQaBugs,
            inProgressBugs,
            totalSuites: suites.length,
            totalCases: totalCasesCount,
            passedCases: passedCasesCount,
            completionRate,
            recentRunsCount: recentRuns.length,
          }
        };
      })
    );

    res.json(projectSummaries);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email role avatar')
      .populate('members', 'name email role avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const bugs = await Bug.find({ project: project._id })
      .populate('reporter', 'name email role avatar')
      .populate('assignee', 'name email role avatar')
      .sort({ createdAt: -1 });

    const suites = await TestSuite.find({ project: project._id })
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });

    const cases = await TestCase.find({ project: project._id })
      .populate('suite', 'title')
      .sort({ key: 1 });

    const recentRuns = await TestRun.find({ project: project._id })
      .populate('executedBy', 'name email')
      .populate('suite', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const activities = await ActivityLog.find({ project: project._id })
      .populate('user', 'name email role avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      project,
      bugs,
      suites,
      cases,
      recentRuns,
      activities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    // RBAC: Tester and Admin can create projects. Developer cannot.
    if (req.user.role === 'developer') {
      return res.status(403).json({ message: 'Developers have View-Only access to project creation' });
    }

    const { name, key, description, repositoryUrl } = req.body;

    const existing = await Project.findOne({ 
      workspace: req.user.workspace, 
      key: key.toUpperCase() 
    });
    if (existing) {
      return res.status(400).json({ message: `Project key '${key}' already in use` });
    }

    const project = await Project.create({
      name,
      key: key.toUpperCase(),
      description,
      repositoryUrl,
      workspace: req.user.workspace,
      owner: req.user._id,
      members: [req.user._id],
    });

    await ActivityLog.create({
      project: project._id,
      user: req.user._id,
      userRole: req.user.role,
      action: 'CREATED_PROJECT',
      entityType: 'project',
      entityId: project._id.toString(),
      entityTitle: project.name,
      message: `${req.user.name} created new project [${project.key}] ${project.name}`,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    if (req.user.role === 'developer') {
      return res.status(403).json({ message: 'Developers cannot edit project settings' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.name = req.body.name || project.name;
    project.description = req.body.description !== undefined ? req.body.description : project.description;
    project.status = req.body.status || project.status;
    project.repositoryUrl = req.body.repositoryUrl !== undefined ? req.body.repositoryUrl : project.repositoryUrl;
    
    if (req.body.members) {
      project.members = req.body.members;
    }

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const archiveProject = async (req, res) => {
  try {
    if (req.user.role === 'developer') {
      return res.status(403).json({ message: 'Developers cannot archive projects' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.status = project.status === 'active' ? 'archived' : 'active';
    await project.save();

    await ActivityLog.create({
      project: project._id,
      user: req.user._id,
      userRole: req.user.role,
      action: project.status === 'archived' ? 'ARCHIVED_PROJECT' : 'UNARCHIVED_PROJECT',
      entityType: 'project',
      entityId: project._id.toString(),
      entityTitle: project.name,
      message: `${req.user.name} ${project.status === 'archived' ? 'archived' : 'restored'} project ${project.name}`,
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectActivities = async (req, res) => {
  try {
    const query = { project: req.params.id };
    if (req.query.role && ['tester', 'developer', 'admin'].includes(req.query.role)) {
      query.userRole = req.query.role;
    }
    const activities = await ActivityLog.find(query)
      .populate('user', 'name email role avatar')
      .populate('project', 'name key')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllActivities = async (req, res) => {
  try {
    const workspaceProjects = await Project.find({ workspace: req.user.workspace }).select('_id');
    const projectIds = workspaceProjects.map(p => p._id);
    const query = { project: { $in: projectIds } };
    if (req.query.role && ['tester', 'developer', 'admin'].includes(req.query.role)) {
      query.userRole = req.query.role;
    }
    const activities = await ActivityLog.find(query)
      .populate('user', 'name email role avatar')
      .populate('project', 'name key')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

