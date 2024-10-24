const mongoose = require('mongoose');

const templateCommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  templateId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Template' },
  content: { type: String, required: true},
  createdDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TemplateComment', templateCommentSchema);