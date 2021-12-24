'use strict';

const mongoose = require('mongoose');
const Validator = require('../src/classes/Validator');

const participantImage = new mongoose.Schema({
  eventID: mongoose.Types.ObjectId,

  filenames: {
    type: [String],
    required: [true, 'Please profide image filename(s)'],
  },

  usernameIG: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    validate: {
      validator: function() {
        return Validator.emailAddress(this.email);
      },
      message: `Email ${this.email} is not a valid email address`,
    },
  },

  name: {
    type: String,
    required: true,
  },

  NIM: {
    type: String,
    required: true,
  },

  sie: {
    type: String,
    required: false,
  },

  OCRResult: {
    type: [String],
    required: true,
  },

  timestamp: {
    type: Date,
    default: new Date(),
  },

  validated: {
    type: Boolean,
    default: false,
  },

  validatedAt: {
    type: Date,
    required: false,
  },

  validationScore: {
    type: Number,
    default: 0,
  },
});

const ParticipantImage = mongoose.model('ParticipantImage', participantImage);

module.exports = ParticipantImage;
