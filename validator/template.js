const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateTemplateInput(data) {
  let errors = {};

  data.category = !isEmpty(data.category) ? data.category : "";
  data.title = !isEmpty(data.title) ? data.title : "";
  data.price = !isEmpty(data.price) ? data.price : "";
  // data.description = !isEmpty(data.description) ? data.description : "";

  if (Validator.isEmpty(data.category)) {
    errors.category = "A category is required";
  }
  /*
  if (Validator.isEmpty(data.subCategory)) {
    errors.subCategory = "Sub-category is required";
  }
  */
  if (Validator.isEmpty(data.price)) {
    errors.price = "Set a starting price";
  }
  if (Validator.isEmpty(data.title)){
      errors.title = "title is required";
  }
  // if (Validator.isEmpty(data.description)) {
  //   errors.description = "Description for the service is required";
  // }
  
  if (!isEmpty(data.liveDemo)) {
    if (!Validator.isURL(data.liveDemo)) {
      errors.liveDemo = "Not a valid URL";
    }
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
