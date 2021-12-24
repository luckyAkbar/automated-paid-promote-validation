'use strict';

require('dotenv').config();

const assert = require('assert').strict;
const noSQLSanitizer = require('mongo-sanitize');
const CustomError = require('./CustomError');
const PaidPromoteEvent = require('../../models/paidPromoteEvent');
const ParticipantImage = require('../../models/participantImage');

class Dashboard {
  constructor(email, responseObject) {
    this.email = noSQLSanitizer(email);
    this.res = responseObject;
    this.createdEvents = [];
    this.eventIDs = [];
    this.validParticipantsData = [];
    this.invalidParticipantsData = [];
    this.participantsData = null;

    assert.notStrictEqual(this.email, undefined, new CustomError('You are not eligible to see this page.', 403));
  };

  _extractAllEventIDsFromCreatedEvents() {
    for (let i = 0; i < this.createdEvents.length; i++) {
      this.eventIDs.push(this.createdEvents[i]._id);
    }
  };

  _countAllValidParticipants() {
    let num = 0;
    const minValidScore = Number(process.env.MIN_VALIDATION_SCORE_TO_BE_VALID_PARTICIPANT);

    for (let i = 0; i < this.participantsData.length; i++) {
      if (this.participantsData[i].validationScore >= minValidScore) {
        num += 1;
      }
    }

    return num;
  };

  _countAllInvalidParticipants() {
    let num = 0;
    const minValidScore = Number(process.env.MIN_VALIDATION_SCORE_TO_BE_VALID_PARTICIPANT);

    for (let i = 0; i < this.participantsData.length; i++) {
      if (this.participantsData[i].validationScore < minValidScore) {
        num += 1;
      }
    }

    return num;
  };

  _extractFieldValueFromParticipantsData(fieldName) {
    const data = [];

    for (let i = 0; i < this.participantsData.length; i++) {
      data.push(this.participantsData[i][fieldName]);
    }

    return data;
  };

  _generateParticipantImageViewLink() {
    const participantImageViewLinks = [];
    const imageRootURL = process.env.ROOT_URL_FOR_PARTICIPANT_IMAGE_VIEW;
    const participantImageNames = this._extractFieldValueFromParticipantsData('filenames');

    for (let i = 0; i < participantImageNames.length; i++) {
      participantImageViewLinks.push(`${imageRootURL}${participantImageNames[i][0]}`);
    }

    return participantImageViewLinks;
  };

  _isImageNameBelongToThisUser(imageFilename) {
    const participantImageFilenames = this._extractFieldValueFromParticipantsData('filenames');

    for (let i = 0; i < participantImageFilenames.length; i++) {
      if (imageFilename === participantImageFilenames[i][0]) return;
    }

    throw new CustomError('This image does not belong in your participants list.', 403);
  };

  _extractValidParticipantsData() {
    for (let i = 0; i < this.participantsData.length; i++) {
      if (this.participantsData[i].validationScore >= Number(process.env.MIN_VALIDATION_SCORE_TO_BE_VALID_PARTICIPANT)) this.validParticipantsData.push(this.participantsData[i])
    }
  };

  _extractInvalidParticipantsData() {
    for (let i = 0; i < this.participantsData.length; i++) {
      if (this.participantsData[i].validationScore < Number(process.env.MIN_VALIDATION_SCORE_TO_BE_VALID_PARTICIPANT)) this.invalidParticipantsData.push(this.participantsData[i])
    }
  };

  _extractFieldObjFromArrOfObj(arrOfObjTarget, fieldname) {
    const result = [];

    for (let i = 0; i < arrOfObjTarget.length; i++) {
      result.push(arrOfObjTarget[i][fieldname]);
    }

    return result;
  };

  _generateValidParticipantImageViewLink() {
    const participantImageViewLinks = [];
    const imageRootURL = process.env.ROOT_URL_FOR_PARTICIPANT_IMAGE_VIEW;
    const participantImageNames = this._extractFieldObjFromArrOfObj(this.validParticipantsData, 'filenames');

    for (let i = 0; i < participantImageNames.length; i++) {
      participantImageViewLinks.push(`${imageRootURL}${participantImageNames[i][0]}`);
    }

    return participantImageViewLinks;
  };

  _generateInvalidParticipantImageViewLink() {
    const participantImageViewLinks = [];
    const imageRootURL = process.env.ROOT_URL_FOR_PARTICIPANT_IMAGE_VIEW;
    const participantImageNames = this._extractFieldObjFromArrOfObj(this.invalidParticipantsData, 'filenames');

    for (let i = 0; i < participantImageNames.length; i++) {
      participantImageViewLinks.push(`${imageRootURL}${participantImageNames[i][0]}`);
    }

    return participantImageViewLinks;
  };

  _filterFinishedEventData({ finished }) {
    const filteredEventData = [];
    const now = new Date();
    for (let i = 0; i < this.createdEvents.length; i++) {
      if ((this.createdEvents[i].endDate < now) === finished) filteredEventData.push(this.createdEvents[i]);
    }

    return filteredEventData;
  };

  _generateEventLinks(eventDetails) {
    const eventLinks = [];

    for (let i = 0; i < eventDetails.length; i++) {
      eventLinks.push(`${process.env.EVENT_LINK_BASE_URL}${eventDetails[i]._id}`);
    }

    return eventLinks;
  }

  sendParticipantImage(imageName) {
    this._isImageNameBelongToThisUser(imageName);
    this.res.sendFile(String(imageName), {
      root: process.env.ROOT_PARTICIPANT_IMAGE_STORAGE_PATH
    });
  };

  async _getAllCreatedEvents() {
    try {
      this.createdEvents = await PaidPromoteEvent.find({ issuer: this.email });
    } catch (e) {
      console.log('System failed to fetch all created events for user dashboard. This may result the user see missing data on their dashboard.', e);
    }
  };

  async _getAllParticipantsData() {
    this._extractAllEventIDsFromCreatedEvents();

    try {
      this.participantsData = await ParticipantImage.find({ eventID: { $in: this.eventIDs } });
    } catch (e) {
      console.log(e)
    }
  };

  async renderMainDashboard() {
    try {
      await this._getAllCreatedEvents();
      await this._getAllParticipantsData();

      this.res.render('dashboard', {
        now: new Date(),
        sumCreatedEvents: this.createdEvents.length,
        sumParticipants: this.participantsData.length,
        sumValidParticipants: this._countAllValidParticipants(),
        sumInvalidParticipants: this._countAllInvalidParticipants(),
      });
    } catch (e) {
      this.res.sendStatus(500);
    }
  };

  async renderTotalParticipantsDashboard() {
    try {
      await this._getAllCreatedEvents();
      await this._getAllParticipantsData();

      this.res.render('dashboard-totalParticipants', {
        names: this._extractFieldValueFromParticipantsData('name'),
        usernames: this._extractFieldValueFromParticipantsData('usernameIG'),
        imageLinks: this._generateParticipantImageViewLink(),
      });
    } catch (e) {
      this.res.sendStatus(500);
    }
  };

  async participantImageAccessHandler(imageName) {
    try {
      await this._getAllCreatedEvents();
      await this._getAllParticipantsData();
      
      this.sendParticipantImage(imageName);
    } catch (e) {
      this.res.status(e.HTTPErrorStatus).json({ message: e.message });
    }
  };

  async renderValidPartipantsDashboard() {
    try {
      await this._getAllCreatedEvents();
      await this._getAllParticipantsData();
      this._extractValidParticipantsData();

      this.res.status(200).render('dashboard-validParticipants', {
        names: this._extractFieldObjFromArrOfObj(this.validParticipantsData, 'name'),
        usernames: this._extractFieldObjFromArrOfObj(this.validParticipantsData, 'usernameIG'),
        imageLinks: this._generateValidParticipantImageViewLink(),
        pageTitle: 'Peserta Valid',
      });
    } catch (e) {
      res.sendStatus(500);
    }
  };

  async renderInvalidParticipantsDashboard() {
    try {
      await this._getAllCreatedEvents();
      await this._getAllParticipantsData();
      this._extractInvalidParticipantsData();

      this.res.status(200).render('dashboard-validParticipants', {
        names: this._extractFieldObjFromArrOfObj(this.invalidParticipantsData, 'name'),
        usernames: this._extractFieldObjFromArrOfObj(this.invalidParticipantsData, 'usernameIG'),
        imageLinks: this._generateInvalidParticipantImageViewLink(),
        pageTitle: 'Peserta Invalid',
      });
    } catch (e) {
      res.sendStatus(500);
    }
  };

  async renderFinishedEventDashboard() {
    try {
      await this._getAllCreatedEvents();
      await this._getAllParticipantsData();
      const finishedEvent = this._filterFinishedEventData({ finished: true });
      
      this.res.status(200).render('dashboard-kegiatanList', {
        pageTitle: 'Kegiatan Selesai',
        eventNames: this._extractFieldObjFromArrOfObj(finishedEvent, 'eventName'),
        eventLinks: this._generateEventLinks(finishedEvent),
      });
    } catch (e) {
      res.sendStatus(500);
    }
  };

  async renderUnfinishedEventDashboard() {
    try {
      await this._getAllCreatedEvents();
      await this._getAllParticipantsData();
      const unfinishedEvent = this._filterFinishedEventData({ finished: false });
      
      this.res.status(200).render('dashboard-kegiatanList', {
        pageTitle: 'Kegiatan Belum Selesai',
        eventNames: this._extractFieldObjFromArrOfObj(unfinishedEvent, 'eventName'),
        eventLinks: this._generateEventLinks(unfinishedEvent),
      });
    } catch (e) {
      res.sendStatus(500);
    }
  }
};

module.exports = Dashboard;
