const mongoose = require('mongoose');

const topicNameSchema = new mongoose.Schema({
  ru: { type: String },
  en: { type: String },
});

const topicSchema = new mongoose.Schema({
  name: { type: topicNameSchema, required: true },
});

module.exports = mongoose.model('Topic', topicSchema);