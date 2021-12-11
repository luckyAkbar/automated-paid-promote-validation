const router = require('express').Router();

const { createPaidPromoteEventHandler } = require('../handler/createPaidPromoteEventHandler');
const { paidPromoteParticipantImageHandler } = require('../handler/paidPromoteParticipantImageUploadHandler');
const { eventDataHandler } = require('../handler/eventDataHandler');

router.route('/')
  .get((req, res) => {
    res.status(200).json({ message: 'ini homepage' });
  });

router.route('/create')
  .post(createPaidPromoteEventHandler);

router.route('/form/:eventID')
  .post(eventDataHandler);

router.route('/upload/:eventID')
  .post(paidPromoteParticipantImageHandler);

router.route('/validation-form/:formId')
  .get((req, res) => {
    res.status(200).json({ message: `ini fill validation form untuk ${req.params.formId}` });
  });

router.route('/result/validation-form/:formId')
  .get((req, res) => {
    res.status(200).json({ message: `ini halaman result untuk form ${req.params.formId}` });
  });

module.exports = { router };
