import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  key: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
  },
  healthScore: {
    type: Number,
    default: 92,
    min: 0,
    max: 100,
  },
  repositoryUrl: {
    type: String,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

export default mongoose.model('Project', projectSchema);

