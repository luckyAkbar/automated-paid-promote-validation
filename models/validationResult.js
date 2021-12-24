'use strict';

const mongoose = require('mongoose');

const validationResult = new mongoose.Schema({
  participantImageID: {
    type: mongoose.Types.ObjectId,
    required: true,
  },

  OCRValidationResult: {
    type: Boolean,
    required: true,
  },

  imageRecognitionResult: {
    type: Boolean,
    required: true,
  },

  validationScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
});

const ValidationResult = mongoose.model('ValidationResult', validationResult);

module.exports = ValidationResult;
