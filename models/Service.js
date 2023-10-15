const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create Schema
const ServiceSchema = new Schema({
  user : {
    type : Schema.Types.ObjectId,
    ref : "users"
  },
  category : {
    type : String,
    required : true
  },
  coverPicture: {
    type: String,
  },
  header: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  video: {
    type: String,
  },
  activate : {
    type : Boolean,
    default : false
  }
});

module.exports = Service = mongoose.model("service", ServiceSchema);
