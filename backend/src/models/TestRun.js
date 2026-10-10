import mongoose from 'mongoose';

const testRunSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  runNumber: {
    type: Number,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  suite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSuite',
  },
  executedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Aborted'],
    default: 'In Progress',
  },
  environment: {
    type: String,
    default: 'Staging Environment',
  },
  results: [{
    testCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestCase',
      required: true,
    },
    status: {
      type: String,
      enum: ['Untested', 'Pass', 'Fail', 'Blocked', 'Skipped'],
      default: 'Untested',
    },
    notes: {
      type: String,
      default: '',
    },
    createdBug: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bug',
    },
    executedAt: {
      type: Date,
    },
  }],
  totalCases: { type: Number, default: 0 },
  passedCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  blockedCount: { type: Number, default: 0 },
  skippedCount: { type: Number, default: 0 },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.model('TestRun', testRunSchema);

