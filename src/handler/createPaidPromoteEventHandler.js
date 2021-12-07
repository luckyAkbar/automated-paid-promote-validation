'use strict';
require('dotenv').config();

const ImageUploadProcessor = require('../classses/ImageUploadProcessor');
const CustomError = require('../classses/CustomError');
const Validator = require('../classses/Validator');
const PaidPromoteEvent = require('../classses/PaidPromoteEvent');

const createPaidPromoteEventHandler = (req, res) => {
  const maxUploadedImages = Number(process.env.MAX_UPLOADED_IMAGES_IN_CREATE_VALIDATION_FORM);
  const imageUploadHandler = new ImageUploadProcessor('avatar', maxUploadedImages);
  const multiUploadHandler = imageUploadHandler.createMultiUploadHandler();
  const mandatoryKeyLists = process.env.LIST_MANDATORY_KEY_DATA_TO_VALIDATE_CREATE_VALIDATION_FORM.split(',');
  const minUploadedImage = 1;

  multiUploadHandler(req, res, async (err) => {
    if (err) {
      res.status(403).json({ errorMessage: `${CustomError.imageUploadErrorMessage} Error message: ${err.message}` });
      return;
    }
  
    const paidPromoteData = PaidPromoteEvent.getPaidPromoteData(req.body, req.files);
    const paidPromoteEvent = new PaidPromoteEvent(paidPromoteData);
  
    try {
      Validator.createValidationForm(req, minUploadedImage, mandatoryKeyLists);
      const result = await paidPromoteEvent.createEvent();
  
      res.status(201).json({ eventId: result._id });
    } catch (e) {
      console.log(e);
      res.status(e.HTTPErrorStatus).json({ message: e.errrorMsg })
    }
  });
};

module.exports = { createPaidPromoteEventHandler };

// console.log(req.files);
//   console.log(req.file);
//   res.sendStatus(200);
//   return
//   try {
//     const paidPromoteEvent = new PaidPromoteEvent(
//       eventName = 'Test Event Name',
//       startDate = '2021-12-19',
//       endDate = '2021-12-21',
//     );

//     await paidPromoteEvent.createEvent();

//     res.status(201).json({ message: 'OK' })
//   } catch (e) {
//     console.log('error happen:', e);
//   }