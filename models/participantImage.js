'use strict';

const mongoose = require('mongoose');

const participantImage = new mongoose.Schema({
  eventID: mongoose.Types.ObjectId,

  filename: {
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

  timestamp: {
    type: Date,
    default: new Date(),
  },
});

const ParticipantImage = mongoose.model('ParticipantImage', participantImage);

module.exports = ParticipantImage;
