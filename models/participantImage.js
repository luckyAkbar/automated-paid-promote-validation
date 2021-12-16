'use strict';

const mongoose = require('mongoose');

const participantImage = new mongoose.Schema({
  eventID: mongoose.Types.ObjectId,

  filenames: {
    type: [String],
    required: [true, 'Please profide image filename(s)'],
  },

  usernameIG: {
    type: String,
    default: '',
  },

  email: {
    type: String,
    default: '',
  },

  NIM: {
    type: String,
    default: '',
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
});

const ParticipantImage = mongoose.model('ParticipantImage', participantImage);

module.exports = ParticipantImage;
