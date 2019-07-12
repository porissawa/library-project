const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  slackID: String,
  googleID: String,
  email: {type: String, unique: true },
  role: {
    type: String,
    enum: ['GUEST', 'EDITOR', 'ADMIN'],
    default: 'GUEST',
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
