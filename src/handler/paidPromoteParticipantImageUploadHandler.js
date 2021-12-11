'use strict';

const PaidPromoteParticipantsHandler = require('../classes/PaidPromoteParticipantsHandler');
const CustomError = require('../classes/CustomError');

const paidPromoteParticipantImageHandler = async (req, res) => {
  const { eventID } = req.params;
  const paidPromoteParticipantsHandler = new PaidPromoteParticipantsHandler(eventID);
  
  try {
    await PaidPromoteParticipantsHandler.checkIsEventExists(eventID);
    const participantImageHandler = await paidPromoteParticipantsHandler.createUploadHandler();

    participantImageHandler(req, res, async (err) => {
      if (err) {
        res.status(403).json({ errorMessage: `${CustomError.imageUploadErrorMessage} Error message: ${err.message}` });
        return;
      }

      await paidPromoteParticipantsHandler.saveImages(req, res);
    });
  } catch (e) {
    res.status(e.HTTPErrorStatus).json({ message: e.message });
  }
};

module.exports = { paidPromoteParticipantImageHandler };
