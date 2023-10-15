const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateChapterInput(data) {
  let errors = {};

  data.chapter = !isEmpty(data.chapter) ? data.chapter : "";
  data.title = !isEmpty(data.title) ? data.title : "";
  data.summary = !isEmpty(data.summary) ? data.summary : "";
  data.numberOfLecture = !isEmpty(data.numberOfLecture) ? data.numberOfLecture : "";

  if (Validator.isEmpty(data.chapter)) {
    errors.chapter = "A chapter is required";
  }
  if (Validator.isEmpty(data.title)) {
    errors.title = "title field is required";
  }
  if (Validator.isEmpty(data.summary)) {
    errors.summary = "summary for the service is required";
  }
  if (Validator.isEmpty(data.numberOfLecture)) {
    errors.numberOfLecture = "number of lectures for this chapter is required"
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
