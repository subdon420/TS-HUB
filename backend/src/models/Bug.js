import mongoose from 'mongoose';

const bugSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Open', 'In Progress', 'Ready for QA', 'Verified & Closed', 'Reopened'],
    default: 'Open',
  },
  severity: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium',
  },
  priority: {
    type: String,
    enum: ['P1', 'P2', 'P3', 'P4'],
    default: 'P2',
  },
  environment: {
    os: { type: String, default: 'Windows 11' },
    browser: { type: String, default: 'Chrome 128' },
    device: { type: String, default: 'Desktop' },
    buildVersion: { type: String, default: 'v1.4.2-staging' },
  },
  reproductionSteps: {
    type: String,
    default: '1. Navigate to target screen\n2. Perform action\n3. Observe unexpected anomaly',
  },
  expectedBehavior: {
    type: String,
    default: '',
  },
  actualBehavior: {
    type: String,
    default: '',
  },
  attachments: [{
    name: String,
    url: String,
    fileType: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now },
  }],
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  gitPrLink: {
    type: String,
    default: '',
  },
  commitHash: {
    type: String,
    default: '',
  },
  resolutionNotes: {
    type: String,
    default: '',
  },
  resolvedAt: {
    type: Date,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: {
    type: Date,
  },
  verificationNotes: {
    type: String,
    default: '',
  },
  linkedTestCase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCase',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Bug', bugSchema);

