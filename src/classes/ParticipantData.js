'use strict';

require('dotenv').config();

const assert = require('assert').strict;
const axios = require('axios');
const noSQLSanitizer = require('mongo-sanitize');
const CustomError = require('./CustomError');
const ParticipantImage = require('../../models/participantImage');
const PaidPromoteEvent = require('../../models/paidPromoteEvent');
const Validator = require('./Validator');

class ParticipantData {
  constructor(participantData, eventID, req) {
    this.eventID = eventID;
    this.filenames = this._extractImageName(req);
    this.usernameIG = participantData.usernameIG;
    this.email = participantData.email;
    this.NIM = participantData.NIM;
    this.sie = participantData.sie;
    this.name = participantData.name;
    this.OCRResult = null;
    this.paidPromoteEventDetails = null;
    this.validationScore = 0;
    this.isAlreadyValidated = false;

    this._validate();
  };

  static extractMandatoryData(req) {
    const data = {};
    const datalist = process.env.LIST_MANDATORY_PAID_PROMOTE_PARTICIPANT_DATA.split(',');

    for (let i = 0; i < datalist.length; i++) {
      assert.notStrictEqual(req.body[datalist[i]], undefined, new CustomError(`Data: ${datalist[i]} can't have null value`));
      data[datalist[i]] = req.body[datalist[i]];
    }

    return noSQLSanitizer(data);
  };

  _validate() {
    const listFullData = process.env.LIST_FULL_DATA_REQUIRED_FOR_EACH_PARTICIPANT.split(',');

    for (let i = 0; i < listFullData.length; i++) {
      assert(this[listFullData[i]], undefined, new CustomError(`${listFullData[i]} can't have null value`));
    }

    Validator.emailAddress(this.email);
  }

  _extractImageName({ file, files }) {
    const filenames = [];

    try {
      assert.notStrictEqual(file, undefined);
      filenames.push(file.filename);
    } catch (e) {
      files.forEach((singleFile) => {
        filenames.push(singleFile.filename);
      });
    } finally {
      assert.notStrictEqual(filenames.length, 0, new CustomError('Please upload your image(s) first.'));
      return filenames;
    }
  };

  _findUsernameIGInParticipantOCRResult() {
    const OCRResult = this._cleanOCRResult(this.OCRResult[0].split(','));

    for (let i = 0; i < OCRResult.length; i++) {
      if (OCRResult[i].trim() === '') continue;
      if (OCRResult[i].trim() === this.usernameIG) {
        this.validationScore += 50;
        return;
      }
    }
  };

  _removeNonAlphanumChar(inputString) {
    return inputString.replace(/[^0-9a-z]/gi, '')
  }

  _cleanOCRResult(arrOfString) {
    for (let i = 0; i < arrOfString.length; i++) {
      arrOfString[i] = this._removeNonAlphanumChar(arrOfString[i]);
    }

    return arrOfString;
  }

  _validateOCRResult() {
    const { OCRResult } = this.paidPromoteEventDetails;
    const feedImageOCRResult = this._cleanOCRResult(OCRResult[0].split(','));
    const participantOCRResult = this._cleanOCRResult(this.OCRResult[0].split(','));

    for (let i = 0; i < feedImageOCRResult.length; i++) {
      for (let j = 0; j < participantOCRResult.length; j++) {
        if (feedImageOCRResult[i].trim() === '' || participantOCRResult[j].trim() === '') continue;
        if (feedImageOCRResult[i].trim() === participantOCRResult[j].trim()) this.validationScore += 10;
        if (this.validationScore > 99) return;
      }
    }
  };

  _validateCaptionDetectedOnParticipantImage() {
    const { caption } = this.paidPromoteEventDetails;
    const captionComponents = caption.split(' ');
    const participantOCRResult = this._cleanOCRResult(this.OCRResult[0].split(','));

    for (let i = 0; i < captionComponents.length; i++) {
      if (captionComponents[i] === '') continue;
      
      for (let j = 0; j < participantOCRResult.length; j++) {
        if (captionComponents[i].trim() === participantOCRResult[j].trim()) this.validationScore += 10;
      }
    }
  }

  async fetchOCRResult() {
    try {
      const { data } = await axios.post(process.env.OCR_API_URL, {
        image_names: this.filenames,
      });

      this.OCRResult = data.result;
      return this.OCRResult;
    } catch (e) {
      throw new CustomError('System failed to get OCR result from your uploaded image. Please do it again.', 500);
    }
  };

  async validateOCRResult() {
    try {
      this.paidPromoteEventDetails = await PaidPromoteEvent.findById(
        this.eventID,
        {
          _id: 0,
          OCRResult: 1,
          caption: 1,
        },
      );
      
      this._findUsernameIGInParticipantOCRResult();
      this._validateCaptionDetectedOnParticipantImage();
      this._validateOCRResult();
      this.isAlreadyValidated = true;
    } catch (e) {
      console.log('System failed to perform OCR result validation. This may result user OCR result is not valid (although it may have valid result.', e);
    }
  }

  async saveParticipantData() {
    try {
      const participantImage = new ParticipantImage({
        eventID: this.eventID,
        filenames: this.filenames,
        email: this.email,
        NIM: this.NIM,
        sie: this.sie,
        name: this.name,
        usernameIG: this.usernameIG,
        OCRResult: this.OCRResult,
        validatedAt: new Date(),
        validationScore: this.validationScore,
        validated: this.isAlreadyValidated,
      });

      await participantImage.save();
    } catch (e) {
      throw new CustomError('Server failed to save your data. Please retry.', 500);
    }
  };
};

module.exports = ParticipantData;
