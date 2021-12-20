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
        await participantData.saveParticipantData();

        res.status(500).json({ message: result });
      } catch (e) {
        console.log(e)
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
