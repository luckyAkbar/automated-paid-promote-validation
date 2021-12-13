'use strict';

const PaidPromoteParticipantsHandler = require('../classes/PaidPromoteParticipantsHandler');

const eventDataHandler = async (req, res) => {
  const { body } = req;
  const { eventID } = req.params;

  try {
    await PaidPromoteParticipantsHandler.validateEvent(eventID);
    await PaidPromoteParticipantsHandler.saveParticipantData(body, eventID);

    res.sendStatus(200);
  } catch (e) {
    res.status(e.HTTPErrorStatus).json({ message: e.message });
  }
};

const renderInputFormPage = (req, res) => {
  res.status(200).render('user-page');
};

module.exports = { eventDataHandler, renderInputFormPage };
