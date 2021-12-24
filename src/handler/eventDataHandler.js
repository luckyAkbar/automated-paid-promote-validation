'use strict';

require('dotenv').config();

const PaidPromoteEvent = require('../classes/PaidPromoteEvent');
const ImageUploadProcessor = require('../classes/ImageUploadProcessor');
const ParticipantData = require('../classes/ParticipantData');

const eventDataHandler = async (req, res) => {
  const { eventID } = req.params;
  const imageUploadFieldName = process.env.IMAGE_UPLOAD_FIELDNAME_FOR_PARTICIPANTS;

  try {
    const maxUploadedImages = await PaidPromoteEvent.getMaxUploadedImagesFromEventID(eventID);
    const imageUploadProcessor = new ImageUploadProcessor(imageUploadFieldName, maxUploadedImages);
    const imageUploadHandler = imageUploadProcessor.createUploadHandler();

    imageUploadHandler(req, res, async (err) => {
      try {
        const mandatoryParticipantData = ParticipantData.extractMandatoryData(req);
        const participantData = new ParticipantData(mandatoryParticipantData, eventID, req);
        const result = await participantData.fetchOCRResult();
        res.status(200).render('successPage', {
          message: 'Data anda sudah kami terima.',
        });

        await participantData.validateOCRResult();
        await participantData.saveParticipantData();
      } catch (e) {
        res.status(e.HTTPErrorStatus).json({ message: e.message });
      }
    });
  } catch (e) {
    res.status(e.HTTPErrorStatus).json({ message: e.message });
  }
};

const renderInputFormPage = async (req, res) => {
  const { eventID } = req.params;

  try {
    await PaidPromoteEvent.validateEvent(eventID);
    res.status(200).render('user-page');
  } catch (e) {
    res.status(e.HTTPErrorStatus).json({ message: e.message });
  }
};

module.exports = { eventDataHandler, renderInputFormPage };
