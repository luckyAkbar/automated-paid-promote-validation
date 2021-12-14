'use strict';

require('dotenv').config();

const assert = require('assert').strict;
const ObjectId = require('mongoose').Types.ObjectId;
const noSQLSanitizer = require('mongo-sanitize');
const PaidPromoteEvent = require('../../models/paidPromoteEvent');
const CustomError = require('./CustomError');
const ImageUploadProcessor = require('./ImageUploadProcessor');
const ParticipantImage = require('../../models/participantImage');
const Validator = require('./Validator');
const { getMaxUploadedImagesFromEventID } = require('./PaidPromoteEvent');

class PaidPromoteParticipantsHandler {
  constructor(eventID) {
    this.eventID = noSQLSanitizer(eventID);
    this.fieldName = process.env.IMAGE_UPLOAD_FIELDNAME_FOR_PARTICIPANTS;
    this.maxUploadedImage = 0;
    this.uploadedImagePath = [];
  };

  static async checkIsUserIGInParticipantList(userIG, eventId) {
    const cleanEventId = noSQLSanitizer(eventId);
    const err = new CustomError('Your Instagram Username is not in participants list. Are you sure to continue?');

    try {
      const intendedParticipants = await this.getAllIntendedParticipants(cleanEventId);

      assert.notStrictEqual(intendedParticipants, []);
      assert.notStrictEqual(intendedParticipants.includes(userIG), false);
    } catch (e) {
      if (e instanceof assert.AssertionError) throw err;
      throw new CustomError(`System failed to check wheter user is in participants list on event with ID: ${eventId}`, 500);
    }
  };

  static async getAllIntendedParticipants(eventId) {
    const cleanEventId = noSQLSanitizer(eventId);

    try {
      const { participantsList } = await PaidPromoteEvent.findById(cleanEventId).select({
        participantsList: 1,
        _id: 0,
      });

      return participantsList;
    } catch (e) {
      throw new CustomError(`System failed to get participants list on event with ID: ${eventId}`, 500);
    }
  };

  static async checkAndGetEventDetailIfExists(eventId) {
    const cleanEventId = noSQLSanitizer(eventId);

    try {
      const result = await PaidPromoteEvent.findById(cleanEventId);
      assert.notStrictEqual(result, null);

      return result;
    } catch (e) {
      throw new CustomError(`Event with ID: ${eventId} not found.`, 404);
    }
  };

  static async checkIsEventExists(eventID) {
    const cleanEventID = noSQLSanitizer(eventID);

    try {
      assert.notStrictEqual(cleanEventID, {});
      const result = await PaidPromoteEvent.findById(cleanEventID);
      assert.notStrictEqual(result, null);
    } catch (e) {
      throw new CustomError(`Event with ID: ${eventID} not found.`, 404);
    }
  };

  static async checkIsEventOpen(eventId) {
    const cleanEventID = noSQLSanitizer(eventId);
    const now = new Date();

    try {
      assert.notStrictEqual(cleanEventID, {});
      const {
        endDate,
        startDate,
      } = await PaidPromoteEvent.findById(cleanEventID).select({
        _id: 0,
        endDate: 1,
        startDate: 1,
      });

      assert.notStrictEqual((startDate > now), true, `Event ini belum dibuka, dan akan dibuka pada tanggal: ${startDate}.`);
      assert.notStrictEqual((endDate > now), true, `Event ini sudah ditutup pada tanggal ${endDate}.`);
    } catch (e) {
      throw new CustomError(e.message, 403);
    }
  };

  static async validateEvent(eventID) {
    const cleanEventID = noSQLSanitizer(eventID);

    try {
      const { endDate, startDate } = await this.checkAndGetEventDetailIfExists(cleanEventID);
      Validator.timelineEvent(startDate, endDate);
    } catch (e) {
      throw new CustomError(e.message);
    }
  };

  static async saveParticipantData(requestBody, eventID) {
    const body = noSQLSanitizer(requestBody);
    const cleanEventID = noSQLSanitizer(eventID)
    const { email, NIM, usernameIG } = body;
    const keysList = process.env.LIST_MANDATORY_PAID_PROMOTE_PARTICIPANT_DATA.split(',');

    try {
      Validator.checkIsAllKeyExists(keysList, body);
      
      const updateResult = await ParticipantImage.findOneAndUpdate(
        body.participantImageID,
        {
          email,
          NIM,
          usernameIG,
          eventID: cleanEventID,
        },
      );
    } catch (e) {
      throw new CustomError(e.message);
    }
  };

  _extractImageName(file, files) {
    try {
      assert.notStrictEqual(file, undefined);
      this.uploadedImagePath.push(file.filename);
    } catch (e) {
      files.forEach((singleFile) => {
        this.uploadedImagePath.push(singleFile.filename);
      });
    }
  };

  async _saveToDB() {
    const participantImage = new ParticipantImage({
      eventID: this.eventID,
      filename: this.uploadedImagePath,
    });

    try {
      return await participantImage.save();
    } catch (e) {
      throw new CustomError('System failed to save image data to database.', 500);
    }
  };

  async createUploadHandler() {
    try {
      this.maxUploadedImage = await getMaxUploadedImagesFromEventID(this.eventID);
      const imageUploadProcessor = new ImageUploadProcessor(this.fieldName, this.maxUploadedImage);
      const uploadHandler = imageUploadProcessor.createUploadHandler();

      return uploadHandler;
    } catch (e) {
      throw new CustomError(`System failed to create new upload handler for event with ID: ${this.eventID}`);
    }
  };

  async saveImages(req, res) {
    const { file, files } = req;
    this._extractImageName(file, files);

    try {
      const result = await this._saveToDB();
      res.status(201).json({ participantImageID: result._id });
    } catch (e) {
      res.status(e.HTTPErrorStatus).json({ message: e.message });
    }
  };
}

module.exports = PaidPromoteParticipantsHandler;
