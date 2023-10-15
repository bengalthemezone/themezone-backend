const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateWorkInput(data) {
  let errors = {};

  data.category = !isEmpty(data.category) ? data.category : "";
  data.subCategory = !isEmpty(data.subCategory) ? data.subCategory : "";
  data.title = !isEmpty(data.title) ? data.title : "";
  data.company = !isEmpty(data.company) ? data.company : "";
  data.description = !isEmpty(data.description) ? data.description : "";

  if(Validator.isEmpty(data.category)) {
    errors.category = "Category field is required"
  }
  
  if(Validator.isEmpty(data.category)) {
    errors.subCategory = "Subcategory field is required"
  }

  if (Validator.isEmpty(data.title)) {
    errors.title = "A title for the job is required";
  }
  if (Validator.isEmpty(data.company)) {
    errors.company = "Name the company";
  }
  if (Validator.isEmpty(data.description)) {
    errors.description = "Description for this job is required";
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
