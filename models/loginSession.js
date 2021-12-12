'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const Validator = require('../src/classes/Validator');

const loginSession = new mongoose.Schema({
  issuer: {
    type: String,
    required: [true, 'Please insert valid E-mail address in issuer attribue'],
    validate: {
      validator: function() {
        Validator.emailAddress(this.issuer);
      },
      message: 'Invalid email address detected on Login Session Schema.',
    },
  },

  rawJWT: {
    type: String,
    required: [true, 'Please insert JWT Token to rawJWT attribute'],
  },

  issuedAt: {
    type: Number,
    default: Date.now(),
  },

  expiredAt: {
    type: Number,
    default: Date.now() + Number(process.env.JWT_LOGIN_COOKIE_EXPIRES_SEC) * 1000,
  },
});

const LoginSession = mongoose.model('LoginSession', loginSession);

module.exports = LoginSession;
