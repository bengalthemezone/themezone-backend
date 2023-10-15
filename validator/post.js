const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validatePostInput(data) {
  let errors = {};

  data.topic = !isEmpty(data.topic) ? data.topic : "";
  data.question = !isEmpty(data.question) ? data.question : '';

  if (!Validator.isLength(data.question, { min: 10, max: 300 })) {
    errors.question = 'Post must be between 10 and 300 characters';
  }

  if (Validator.isEmpty(data.question)) {
    errors.question = 'Question field is required';
  }
  
  if (Validator.isEmpty(data.topic)) {
      errors.topic = "A topic is required"
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};