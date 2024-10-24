const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  isVisibleInTable: { type: Boolean, default: false},
  answerType: { type: String, required: true}
});

const templateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: {type: String, required: true},
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  accessControl: {type:  String, enum: ['public', 'private'], default: 'public'}, 
  allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  questions: {type: [questionSchema]},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: {type: Boolean, default: false}
}, {timestamps: true});

module.exports = {
  Question: mongoose.model('Question', questionSchema),
  Template: mongoose.model('Template', templateSchema)
};