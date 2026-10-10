import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userRole: {
    type: String,
    enum: ['tester', 'developer', 'admin'],
    default: 'tester',
  },
  action: {
    type: String,
    required: true,
  },
  entityType: {
    type: String,
    enum: ['bug', 'testCase', 'testSuite', 'testRun', 'project'],
    required: true,
  },
  entityId: {
    type: String,
    required: true,
  },
  entityTitle: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    required: true,
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

export default mongoose.model('ActivityLog', activityLogSchema);
