const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, },
  answer: {type: mongoose.Schema.Types.Mixed, required: true }
})

const formSchema = new mongoose.Schema({
  templateId: {type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true, },
  answers: {type: [answerSchema]},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,},
  createdDate: { type: Date, default: Date.now },
  isDeleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Form', formSchema);