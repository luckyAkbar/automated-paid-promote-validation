'use strict';
require('dotenv').config();

const mongoose = require('mongoose');

const user = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Please add email before create an user'],
  },

  password: {
    type: String,
    required: [true, 'Please specify password for each user'],
  },

  role: {
    type: String,
    enum: process.env.AVAILABLE_ROLES.split(','),
  },
});

const User = mongoose.model('User', user);

module.exports = User;
