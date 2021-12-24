'use strict';

const assert = require('assert').strict;
const noSQLSanitizer = require('mongo-sanitize');
const axios = require('axios');
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');
const CustomError = require('./CustomError');
const PaidPromoteEventModel = require('../../models/paidPromoteEvent');

class PaidPromoteEvent {
  constructor(eventData, issuer) {
    const eventDetail = noSQLSanitizer(eventData);
    this.eventID = String(new ObjectId());
    this.eventName = eventDetail.eventName;
    this.startDate = new Date(eventDetail.startDate);
    this.endDate = new Date(eventDetail.endDate);
    this.baseImageNames = eventDetail.baseImageNames;
    this.maxUploadedImagesByParticipant = Number(eventDetail.maxUploadedImagesByParticipant) > 0 ? Number(eventDetail.maxUploadedImagesByParticipant): 1;
    this.participantsList = eventDetail.participantsList;
    this.caption = eventDetail.caption === undefined ? '': eventDetail.caption;
    this.OCRResult = [];
    
    this._validate();
  };

  _validate() {
    const mandatoryDataToInstantiateValidationForm = process.env.LIST_MANDATORY_DATA_TO_INSTANTIATE_NEW_VALIDATION_FORM.split(',');

    assert.notStrictEqual(String(this.startDate), 'Invalid Date', new CustomError('Invalid date on startDate field.'));
    assert.notStrictEqual(String(this.endDate), 'Invalid Date', new CustomError('Invalid date on endDate field.'));
    assert.notStrictEqual((this.maxUploadedImagesByParticipant < 1), true, new CustomError('Minimal image uploaded must be greater than 1'));

    for (let i = 0; i < mandatoryDataToInstantiateValidationForm.length; i++) {
      const keyName = mandatoryDataToInstantiateValidationForm[i]
      assert.notStrictEqual(this[keyName], undefined, `Please define ${keyName} so it's not null.`);
    }
  };

  async createEvent() {
    try {
      this.OCRResult = await this._getOCRResult();
      const paidPromoteEvent = new PaidPromoteEventModel({
        _id: this.eventID,
        eventName: this.eventName,
        startDate: this.startDate,
        endDate: this.endDate,
        baseImages: this.baseImageNames,
        maxUploadedImagesByParticipant: this.maxUploadedImagesByParticipant,
        participantsList: this.participantsList,
        caption: this.caption,
        OCRResult: this.OCRResult,
      });

      await paidPromoteEvent.save();

      return this.eventID;
    } catch (e) {
      throw new CustomError(`System failed to create new Validation Form: ${this.eventName}.`, 500);
    }
  };

  async _getOCRResult() {
    try {
      const { data } = await axios.post(process.env.OCR_API_URL, {
        image_names: this.baseImageNames,
      });

      return data.result;
    } catch (e) {
      console.log('System failed to fetch ocr result from OCR api. This will make ocr result on DB storing null value. Full error message:', e);
    }
  };

  static async validateEvent(eventID) {
    const cleanEventID = noSQLSanitizer(eventID);
    const now = new Date();

    try {
      assert.strictEqual(String(cleanEventID).length, 24, 'Event ID is invalid');
      const result = await PaidPromoteEventModel.findById(cleanEventID);

      assert.notStrictEqual(result, null, 'Event not found.');
      assert.notStrictEqual((result.startDate > now), true, 'Event not started yet.');
      assert.notStrictEqual((result.endDate < now), true, 'Event already closed');
    } catch (e) {
      throw new CustomError(e.message);
    }
  };

  static getBaseImagesPath(uploadedFiles) {
    const imagesPath = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
      imagesPath.push(uploadedFiles[i].filename);
    }

    return imagesPath;
  };

  static getPaidPromoteData(body, files) {
    const requestBody = noSQLSanitizer(body);
    const uploadedFiles = noSQLSanitizer(files);

    const fullFields = process.env.LIST_FULL_DATA_TO_INSTANTIATE_NEW_VALIDATION_FORM.split(',');
    const configurationObject = {};

    for (let i = 0; i < fullFields.length; i++) {
      const keyName = fullFields[i]
      configurationObject[keyName] = requestBody[keyName];
    }

    configurationObject['baseImageNames'] = this.getBaseImagesPath(uploadedFiles);
    return configurationObject;
  };

  static async getMaxUploadedImagesFromEventID(eventID) {
    const cleanEventID = noSQLSanitizer(eventID);

    try {
      const result = await PaidPromoteEventModel.findById(cleanEventID).select({
        _id: 0,
        maxUploadedImagesByParticipant: 1,
      });

      assert.notStrictEqual(result, null, `Event with ID: ${eventID} is not found.`);

      return result.maxUploadedImagesByParticipant;
    } catch (e) {
      if (e instanceof mongoose.Error.CastError) throw new CustomError('Event ID not valid');
      throw new CustomError('System failed to get necessary data to process handling agent.', 500); 
    }
  };
};

module.exports = PaidPromoteEvent;
