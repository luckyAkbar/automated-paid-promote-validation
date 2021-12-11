'use strict';

class CustomError extends Error {
  constructor(errorMsg = '~', HTTPErrorStatus = 400) {
    super(errorMsg);
    this.errorMsg = errorMsg;
    this.HTTPErrorStatus = HTTPErrorStatus;
  }

  static get imageUploadErrorMessage() {
    return 'Upload error because your image(s) against our defined rules.'
  }
}

module.exports = CustomError;