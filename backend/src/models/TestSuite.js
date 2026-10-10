import mongoose from 'mongoose';

const testSuiteSchema = new mongoose.Schema({
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
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['Active', 'Archived'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

export default mongoose.model('TestSuite', testSuiteSchema);

