'use strict';

const CustomError = require('./CustomError');
const assert = require('assert').strict;

class Validator {
  specialCharDetector = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

  constructor() {
    console.log('Warning! You dont need to instantiate Validator class since this class filled with static methods.');
  }

  static checkIsAllKeyExists(keysList, object) { // only works if the object is flat.
    let i = 0;

    try {
      for (i; i < keysList.length; i++) {
        assert.notStrictEqual(object[keysList[i]], undefined, `Missing mandatory keys in data: ${object[keysList[i]]}`)
      }
    } catch (e) {
      throw new CustomError(e.message);
    }
  }

  static isAllImagesUploaded(numImages, imageFiles) {
    if (imageFiles.length < Number(numImages)) throw new CustomError(`You upload only ${imageFiles.length} image(s). But we expect ${numImages} image(s).`);
  }

  static createValidationForm(req, numImages, keyLists) {
    const { body, files } = req;
    const { startDate, endDate } = body;

    this.checkIsAllKeyExists(keyLists, body);
    this.isAllImagesUploaded(numImages, files);
    this.timelineEvent(startDate, endDate);
  }

  static timelineEvent(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start === 'Invalid Date') throw new CustomError('Start date must be instance of Date.');
    if (end === 'Invalid Date') throw new CustomError('End date must be instance of Date.');
    if (end < now) throw new CustomError('Event must not end before now.');
    if (end < start) throw new CustomError('Event must not end before starts.');
  }
}

module.exports = Validator;
