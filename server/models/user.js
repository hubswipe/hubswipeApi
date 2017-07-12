const {mongoose} = require('../db/mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  facebookId: String,
  googleId: String,
  properties: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Property'
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Property'
  }],
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});


const User = mongoose.model('User', UserSchema);

module.exports = {User};
