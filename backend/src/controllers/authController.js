import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'testers_home_super_secret_jwt_key_2026', {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'tester', workspaceCode, workspaceName } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    let workspace;
    if (workspaceCode) {
      workspace = await Workspace.findOne({ code: workspaceCode.toUpperCase() });
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace with specified code not found' });
      }
    } else {
      const generatedCode = (workspaceName ? workspaceName.substring(0, 3) : 'TH') + '-' + Math.floor(1000 + Math.random() * 9000);
      workspace = await Workspace.create({
        name: workspaceName || 'Main Hub',
        code: generatedCode.toUpperCase(),
      });
    }

    const defaultTitle = role === 'developer' ? 'Senior Full-Stack Engineer' : (role === 'admin' ? 'QA Lead / Admin' : 'Senior QA Automation Tester');
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || email)}`;

    const user = await User.create({
      name,
      email,
      password,
      role,
      title: defaultTitle,
      avatar,
      workspace: workspace._id,
    });

    if (!workspace.owner) {
      workspace.owner = user._id;
    }
    workspace.members.push({ user: user._id, role });
    await workspace.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      avatar: user.avatar,
      workspace: {
        _id: workspace._id,
        name: workspace.name,
        code: workspace.code,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, portalRole } = req.body;

    const user = await User.findOne({ email }).populate('workspace');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Strict Portal Role Separation
    if (portalRole && portalRole !== 'admin') {
      if (user.role !== 'admin' && user.role !== portalRole) {
        const requiredName = portalRole === 'tester' ? 'QA Tester' : 'Software Developer';
        const actualName = user.role === 'tester' ? 'QA Tester' : 'Software Developer';
        return res.status(403).json({
          message: `Access Denied: This is the ${requiredName} Portal, but credentials belong to a ${actualName}. Please switch to the ${actualName} Portal.`
        });
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      avatar: user.avatar,
      workspace: user.workspace ? {
        _id: user.workspace._id,
        name: user.workspace.name,
        code: user.workspace.code,
      } : null,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('workspace');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const switchRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['tester', 'developer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findById(req.user._id);
    user.role = role;
    if (role === 'developer') {
      user.title = 'Full-Stack Developer';
    } else if (role === 'tester') {
      user.title = 'QA Engineer';
    } else {
      user.title = 'Tech Lead & QA Admin';
    }
    await user.save();

    res.json({
      message: `Role successfully switched to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkspaceUsers = async (req, res) => {
  try {
    const workspaceId = req.user.workspace?._id || req.user.workspace;
    const filter = workspaceId ? { workspace: workspaceId } : {};
    const users = await User.find(filter).select('name email role title avatar status');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

