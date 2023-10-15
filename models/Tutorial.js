const mongoose = require("mongoose");
const tutorial = require("../validator/tutorial");
const Schema = mongoose.Schema;

//Create Schema
const TutorialSchema = new Schema({
  user : {
    type : Schema.Types.ObjectId,
    ref : "users"
  },
  category : {
    type : String,
    required : true
  },
  verified : {
    type : Boolean
  },
  cardpicture: {
    type: String,
  },
  header: {
    type: String,
    required: true,
  },
  requirements : {
    type : String,
    required : true
  },
  price: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  introVideo: {
    type: String,
  },
  introVideoDescription : {
    type : String,
  },
  activate : {
    type : Boolean,
    default : false
  },
  tutorialVideo : [
      {
        chapter : {
            type : String,
            required : true
        },
        numberOfLecture : {
            type : String,
            required : true
        },
        title : {
            type : String,
            required : true
        },
        summary : {
            type : String,
            required : true,
        }
      }
  ],  
});

module.exports = Tutorial = mongoose.model("tutorial", TutorialSchema);