import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  suite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSuite',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  preconditions: {
    type: String,
    default: '',
  },
  steps: [{
    stepNumber: Number,
    action: String,
    expectedOutcome: String,
  }],
  testData: {
    type: String,
    default: '',
  },
  expectedOutcome: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Deprecated'],
    default: 'Active',
  },
  lastExecutionStatus: {
    type: String,
    enum: ['Untested', 'Pass', 'Fail', 'Blocked', 'Skipped'],
    default: 'Untested',
  },
  linkedBugs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bug',
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

export default mongoose.model('TestCase', testCaseSchema);

