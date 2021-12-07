const router = require('express').Router();
const express = require('express');
const app = express();
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' }).array('avatar', 10);

// const { ImageUploadProcessor } = require('../classses/ImageUploadProcessor');

const { createPaidPromoteEventHandler } = require('../handler/createPaidPromoteEventHandler');

router.route('/')
  .get((req, res) => {
    res.status(200).json({ message: 'ini homepage' });
  });

router.route('/create')
  .post((req, res) => {
    createPaidPromoteEventHandler(req, res);
    // const upload = new ImageUploadProcessor().singleImageUploadHandler().array('avatar');
    // upload(req, res, (err) => {
    //   if (err) {
    //     res.status(403).json({ errorMessage: `${CustomError.imageUploadErrorMessage} Error message: ${err.message}` });
    //     return;
    //   }

    //   console.log(req.files);
    //   res.sendStatus(200);
    // });
  })
  .get((req, res) => {
    res.status(200).end(`
      <form action="/create" method="post" enctype="multipart/form-data">
        <input type="file" name="avatar" />
      </form>
    `);
  });

router.route('/validation-form/:formId')
  .get((req, res) => {
    res.status(200).json({ message: `ini fill validation form untuk ${req.params.formId}` });
  });

router.route('/result/validation-form/:formId')
  .get((req, res) => {
    res.status(200).json({ message: `ini halaman result untuk form ${req.params.formId}` });
  });

module.exports = { router };
