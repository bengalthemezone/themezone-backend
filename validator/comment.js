const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validatePostInput(data) {
  let errors = {};

  data.comment = !isEmpty(data.comment) ? data.comment : '';

  if (!Validator.isLength(data.comment, { min: 10, max: 300 })) {
    errors.comment = 'Post must be between 10 and 300 characters';
  }

  if (Validator.isEmpty(data.comment)) {
    errors.comment = 'comment field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};