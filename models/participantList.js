'use strict';

const mongoose = require('mongoose');

const participantList = new mongoose.Schema({
  eventId: {
    type: mongoose.Types.ObjectId,
    required: [true, 'Please set a valid ObjectId as Event Id before creating new participant list.'],
    validate: {
      validator: (eventId) => {
        return mongoose.isValidObjectId(eventId);
      },
      message: 'Please use valid ObjectId as unique identifier.',
    },
  },


});

const ParticipantList = mongoose.model('ParticipantList', participantList);

module.exports = { ParticipantList };
