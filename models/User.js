const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {type:  String, enum: ['user', 'admin'], default: 'user'}, 
  registrationDate: { type: Date, default: Date.now },
  lastLoginDate: { type: Date },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);