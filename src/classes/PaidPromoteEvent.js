'use strict';

const assert = require('assert').strict;
const noSQLSanitizer = require('mongo-sanitize');
const CustomError = require('./CustomError');
const PaidPromoteEventModel = require('../../models/paidPromoteEvent');

class PaidPromoteEvent {
  constructor(paidPromoteData) {
    const {
      eventName,
      startDate,
      endDate,
      baseImageNames,
      maxUploadedImagesByParticipant,
      caption = '',
    } = paidPromoteData;

    this._assertNotNull(paidPromoteData);
    this.eventName = eventName;
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.caption = caption;
    this.baseImageNames = baseImageNames;
    this.maxUploadedImagesByParticipant = maxUploadedImagesByParticipant;
    
    assert.notStrictEqual(String(this.startDate), 'Invalid Date', new CustomError('Invalid date on startDate field.'));
    assert.notStrictEqual(String(this.endDate), 'Invalid Date', new CustomError('Invalid date on endDate field.'));
  };

  _assertNotNull(configurationObject) {
    const mandatoryDataToInstantiateValidationForm = process.env.LIST_MANDATORY_DATA_TO_INSTANTIATE_NEW_VALIDATION_FORM.split(',');

    for (let i = 0; i < mandatoryDataToInstantiateValidationForm.length; i++) {
      const keyName = mandatoryDataToInstantiateValidationForm[i]
      assert.notStrictEqual(configurationObject[keyName], undefined, `Please define ${keyName} so it's not null.`)
    }
  };

  async createEvent() {
    const paidPromoteEvent = new PaidPromoteEventModel({
      eventName: this.eventName,
      startDate: this.startDate,
      endDate: this.endDate,
      baseImages: this.baseImageNames,
      caption: this.caption,
      maxUploadedImagesByParticipant: this.maxUploadedImagesByParticipant,
    });

    try {
      return await paidPromoteEvent.save();
    } catch (e) {
      throw new CustomError(`System failed to create new Validation Form: ${this.eventName}.`, 500);
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

    const fullValidationFormFields = process.env.LIST_FULL_DATA_TO_INSTANTIATE_NEW_VALIDATION_FORM.split(',');
    const configurationObject = {};

    for (let i = 0; i < fullValidationFormFields.length; i++) {
      const keyName = fullValidationFormFields[i]
      
      try {
        assert.notStrictEqual(requestBody[keyName], undefined);
        configurationObject[keyName] = requestBody[keyName];
      } catch (e) {
        continue;
      }
    }

    configurationObject['baseImageNames'] = this.getBaseImagesPath(uploadedFiles);

    return configurationObject;
  };

  static async getMaxUploadedImagesFromEventID(eventID) {
    const cleanEventID = noSQLSanitizer(eventID);

    try {
      const { maxUploadedImagesByParticipant } = await PaidPromoteEventModel.findById(cleanEventID).select({
        _id: 0,
        maxUploadedImagesByParticipant: 1,
      });

      return maxUploadedImagesByParticipant;
    } catch (e) {
      throw new CustomError(`System failed to get max uploaded images from event with ID: ${eventID}.`, 500);
    }
  };
};

module.exports = PaidPromoteEvent;
