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
      maxUploadedImagesByParticipant = 1,
      caption = '',
    } = paidPromoteData;

    this._assertNotNull(paidPromoteData);
    this.eventName = eventName;
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.caption = caption;
    this.baseImageNames = baseImageNames;
    this.maxUploadedImagesByParticipant = maxUploadedImagesByParticipant;
  }

  _assertNotNull(configurationObject) {
    const mandatoryDataToInstantiateValidationForm = process.env.LIST_MANDATORY_DATA_TO_INSTANTIATE_NEW_VALIDATION_FORM.split(',');

    for (let i = 0; i < mandatoryDataToInstantiateValidationForm.length; i++) {
      const keyName = mandatoryDataToInstantiateValidationForm[i]
      assert.notStrictEqual(configurationObject[keyName], undefined, `Please define ${keyName} so it's not null.`)
    }
  }

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
      const result = await paidPromoteEvent.save();
      return result;
    } catch (e) {
      console.log(e)
      throw new CustomError(`System failed to create new Validation Form: ${this.eventName}.`, 500);
    }
  }

  static getBaseImagesPath(uploadedFiles) {
    const imagesPath = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
      imagesPath.push(uploadedFiles[i].filename);
    }

    return imagesPath;
  }

  static getPaidPromoteData(body, files) {
    const requestBody = noSQLSanitizer(body);
    const uploadedFiles = noSQLSanitizer(files);

    const mandatoryDataToInstantiateValidationForm = process.env.LIST_MANDATORY_DATA_TO_INSTANTIATE_NEW_VALIDATION_FORM.split(',');
    const configurationObject = {};

    for (let i = 0; i < mandatoryDataToInstantiateValidationForm.length; i++) {
      const keyName = mandatoryDataToInstantiateValidationForm[i]
      configurationObject[keyName] = requestBody[keyName];
    }

    configurationObject['baseImageNames'] = this.getBaseImagesPath(uploadedFiles);

    return configurationObject;
  }
};

module.exports = PaidPromoteEvent;
