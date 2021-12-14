'use strict';
require('dotenv').config();

const ImageUploadProcessor = require('../classes/ImageUploadProcessor');
const CustomError = require('../classes/CustomError');
const Validator = require('../classes/Validator');
const PaidPromoteEvent = require('../classes/PaidPromoteEvent');

const createPaidPromoteEventHandler = (req, res) => {
  const maxUploadedImages = Number(process.env.MAX_UPLOADED_IMAGES_IN_CREATE_VALIDATION_FORM);
  const imageUploadFieldName = process.env.IMAGE_UPLOAD_FIELDNAME_FOR_CREATE_VALIDATION_FORM
  const imageUploadHandler = new ImageUploadProcessor(imageUploadFieldName, maxUploadedImages);
  const multiUploadHandler = imageUploadHandler.createMultiUploadHandler();
  const mandatoryKeyLists = process.env.LIST_MANDATORY_KEY_DATA_TO_VALIDATE_CREATE_VALIDATION_FORM.split(',');
  const minUploadedImage = 1;

  multiUploadHandler(req, res, async (err) => {
    if (err) {
      res.status(403).json({ errorMessage: `${CustomError.imageUploadErrorMessage} Error message: ${err.message}` });
      return;
    }
  
    const paidPromoteData = PaidPromoteEvent.getPaidPromoteData(req.body, req.files);
  
    try {
      Validator.createValidationForm(req, minUploadedImage, mandatoryKeyLists);
      
      const paidPromoteEvent = new PaidPromoteEvent(paidPromoteData);
      const { _id } = await paidPromoteEvent.createEvent();
  
      res.status(201).json({ eventID: _id });

      await paidPromoteEvent.getOCRResult();
      await paidPromoteEvent.storeOCRResult();
    } catch (e) {
      res.status(e.HTTPErrorStatus).json({ message: e.errorMsg })
    }
  });
};

module.exports = { createPaidPromoteEventHandler };
