'use strict';
require('dotenv').config();

const crypto = require('crypto');
const multer = require('multer');
const CustomError = require('./CustomError');

class ImageUploadProcessor {
  constructor(fieldname, maxFiles = 3) {
    this.fieldname = fieldname;
    this._maxFiles = maxFiles;
    this._storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, process.env.UPLOADED_IMAGE_STORAGE_PATH);
      },
      filename: function (req, file, cb) {
        const uniqueFilename = `${crypto.randomUUID()}.${file.extention}`;

        cb(null, uniqueFilename);
      },
    });
  };

  _setFileExtention(file) {
    file.extention = file.originalname.substring(file.originalname.lastIndexOf('.') + 1);
  };

  _mimetypeFilter = (imageMimetype) => {
    const acceptedImageMimetypes = process.env.ACCEPTED_IMAGE_MIMETYPES.split(',');
  
    if (acceptedImageMimetypes.includes(imageMimetype)) return;
    throw new CustomError('Mimetype images not allowed.', 403);
  };
  
  _imageExtentionFilter = (filename) => {
    const acceptedImageExtention = process.env.ACCEPTED_IMAGE_EXTENTIONS.split(',');
  
    for (let i = 0; i < acceptedImageExtention.length; i++) {
      if (filename.endsWith(acceptedImageExtention[i])) return;
    }
  
    throw new CustomError('File extention is not accepted.');
  };
  
  _fileFilter = (req, file, cb) => {
    try {
      this._mimetypeFilter(file.mimetype);
      this._imageExtentionFilter(file.originalname);
      this._setFileExtention(file);
      cb(null, true);
    } catch (e) {
      cb(e, false);
    }
  };
  
  createSingleUploadHandler = () => {
    return multer({
      storage: this._storage,
      fileFilter: this._fileFilter,
      limits: {
        files: this._maxFiles,
        fileSize: Number(process.env.MAX_UPLOADED_IMAGE_SIZE)
      },
    }).single(this.fieldname);
  };

  createMultiUploadHandler(maxFiles = this._maxFiles) {
    return multer({
      storage: this._storage,
      fileFilter: this._fileFilter,
      limits: {
        files: this._maxFiles,
        fileSize: Number(process.env.MAX_UPLOADED_IMAGE_SIZE)
      },
    }).array(this.fieldname, maxFiles);
  };

  createUploadHandler() {
    if (this._maxFiles <= 1) return this.createSingleUploadHandler();
    return this.createMultiUploadHandler(this._maxFiles);
  }
}

module.exports = ImageUploadProcessor;
