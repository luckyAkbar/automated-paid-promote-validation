'use strict';

require('dotenv').config();

const assert = require('assert').strict;
const axios = require('axios');
const CustomError = require('./CustomError');
const ParticipantImage = require('../../models/participantImage');

class ParticipantData {
  constructor(participantData, eventID, req) {
    this.eventID = eventID;
    this.filenames = this._extractImageName(req);
    this.usernameIG = participantData.usernameIG;
    this.email = participantData.email;
    this.NIM = participantData.NIM;
    this.sie = participantData.sie;
    this.OCRResult = null;

    this._validate();
  };

  static extractMandatoryData(req) {
    const data = {};
    const datalist = process.env.LIST_MANDATORY_PAID_PROMOTE_PARTICIPANT_DATA.split(',');

    for (let i = 0; i < datalist.length; i++) {
      assert.notStrictEqual(req.body[datalist[i]], undefined, new CustomError(`Data: ${datalist[i]} can't have null value`));
      data[datalist[i]] = req.body[datalist[i]];
    }

    return data;
  };

  _validate() {
    const listFullData = process.env.LIST_FULL_DATA_REQUIRED_FOR_EACH_PARTICIPANT.split(',');

    for (let i = 0; i < listFullData.length; i++) {
      assert(this[listFullData[i]], undefined, new CustomError(`${listFullData[i]} can't have null value`));
    }
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

  async saveParticipantData() {
    try {
      const participantImage = new ParticipantImage({
        eventID: this.eventID,
        filenames: this.filenames,
        email: this.email,
        NIM: this.NIM,
        sie: this.sie,
        OCRResult: this.OCRResult,
      });

      await participantImage.save();
    } catch (e) {
      throw new CustomError('Server failed to save your data. Please retry.', 500);
    }
  };
};

module.exports = ParticipantData;
