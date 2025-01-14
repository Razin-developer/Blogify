const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: 'user',
  },
  imageUrl: {
    type: String,
    required: true,
    default: "/images/user/default.png"
  }
}, { timestamps: true });

const User = model('User', userSchema);

module.exports = User;