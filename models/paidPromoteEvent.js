'use strict';

const mongoose = require('mongoose');

const paidPromoteEvent = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Please set event name.'],
  },

  startDate: {
    type: Date,
    required: [true, 'Please set start date before saving new paid promote event.'],
  },

  endDate: {
    type: Date,
    required: [true, 'Please set end date before saving new paid promote event.'],
  },

  baseImages: {
    type: [String],
    required: [true, 'Please provide base image path(s) as model feed.'],
  },

  maxUploadedImagesByParticipant: {
    type: Number,
    default: 1,
  },

  participantsList: {
    type: [String],
    required: false,
  },

  caption: {
    type: String,
    required: false,
  },
});

const PaidPromoteEvent = mongoose.model('PaidPromoteEvent', paidPromoteEvent);

module.exports = PaidPromoteEvent;
