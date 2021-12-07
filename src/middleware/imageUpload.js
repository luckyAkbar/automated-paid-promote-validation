'use strict';

require('dotenv').config();

const { ImageUploadProcessor } = require('../classses/ImageUploadProcessor');

const createPaidPromoteImageUpload = (req, res, next) => {
  console.log('masuk middleware')
  const imageUploadProcessor = new ImageUploadProcessor( req, 10, 5, process.env.UPLOADED_IMAGE_STORAGE_PATH);

  try {
    imageUploadProcessor.uploadHandler.single('imageUpload');
    console.log('keluar middleware')
    next();
  } catch (e) {
    console.log('upload gagal', e);
    res.sendStatus(400);
  }
}

module.exports = { createPaidPromoteImageUpload };
