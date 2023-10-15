const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateTutorialInput(data) {
  let errors = {};

  data.category = !isEmpty(data.category) ? data.category : "";
  data.header = !isEmpty(data.header) ? data.header : "";
  data.price = !isEmpty(data.price) ? data.price : "";
  data.description = !isEmpty(data.description) ? data.description : "";
  data.requirements = !isEmpty (data.requirements) ? data.requirements : "";

  if(Validator.isEmpty(data.requirements)) {
    errors.requirements = "Requirement field is required"
  }

  if(Validator.isEmpty(data.category)) {
    errors.category = "Category fields is required"
  }
  
  if (Validator.isEmpty(data.header)) {
    errors.header = "A header is required";
  }
  if (Validator.isEmpty(data.price)) {
    errors.price = "Set a starting price";
  }
  if (Validator.isEmpty(data.description)) {
    errors.description = "Description for the service is required";
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
