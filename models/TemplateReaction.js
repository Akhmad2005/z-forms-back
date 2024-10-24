const mongoose = require('mongoose');

const templateReactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  templateId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Template' },
  type: { type: String, enum: ['like', 'dislike'], required: true},
});

// Создание составного индекса, гарантирующего, что каждый пользователь может иметь только одну реакцию на форму
templateReactionSchema.index({ userId: 1, templateId: 1 }, { unique: true });

module.exports = mongoose.model('TemplateReaction', templateReactionSchema);