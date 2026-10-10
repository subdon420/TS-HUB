import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: ['bug', 'testCase'],
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityTypeModel',
  },
  entityTypeModel: {
    type: String,
    enum: ['Bug', 'TestCase'],
    default: 'Bug',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  codeSnippet: {
    language: { type: String, default: 'json' },
    code: { type: String, default: '' },
  },
}, {
  timestamps: true,
});

export default mongoose.model('Comment', commentSchema);

