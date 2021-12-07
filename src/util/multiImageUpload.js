const fileUpload = require('express-fileupload');

const fileUploadMiddleware = (req, res, next) => {
  fileUpload();
  next();
}

const multiFileUploadHandler = async (req, res) => {
  console.log(req.files);
  res.sendStatus(200);
}

module.exports = { fileUploadMiddleware, multiFileUploadHandler };
