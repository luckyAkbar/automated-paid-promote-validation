const router = require('express').Router();

const { createPaidPromoteEventHandler } = require('../handler/createPaidPromoteEventHandler');
const { paidPromoteParticipantImageHandler } = require('../handler/paidPromoteParticipantImageUploadHandler');
const { eventDataHandler, renderInputFormPage } = require('../handler/eventDataHandler');
const { signupHandler, renderSignupPage } = require('../handler/signupHandler');
const { loginHandler, renderLoginPage } = require('../handler/loginHandler');
const { renderAdminPage } = require('../handler/adminPageHandler');
const { checkLoginStatus } = require('../middleware/checkLoginStatus');

router.route('/')
  .get((req, res) => {
    res.status(200).json({ message: 'ini homepage' });
  });

router.route('/create')
  .post(createPaidPromoteEventHandler);

router.route('/login')
  .get(renderLoginPage)
  .post(loginHandler);

router.route('/signup')
  .get(renderSignupPage)
  .post(signupHandler);

router.route('/protected')
  .get(checkLoginStatus, (req, res) => {
    res.sendStatus(200);
  });

router.route('/admin')
  .get(checkLoginStatus, renderAdminPage);

router.route('/form/:eventID')
  .get(renderInputFormPage)
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
