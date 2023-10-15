const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateServiceInput(data) {
  let errors = {};

  data.header = !isEmpty(data.header) ? data.header : "";
  data.category = !isEmpty(data.category) ? data.category : "";
  data.price = !isEmpty(data.price) ? data.price : "";
  data.description = !isEmpty(data.description) ? data.description : "";

  if (Validator.isEmpty(data.header)) {
    errors.header = "A header is required";
  }
  if (Validator.isEmpty(data.category)) {
    errors.category = "Select a category";
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
