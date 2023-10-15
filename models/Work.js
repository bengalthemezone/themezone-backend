const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WorkSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "users",
    },
    category : {
        type : String,
        required : true,
    },
    subCategory : {
        type : String,
        required : true
    },
    company : {
        type : String,
        required : true
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    typeOfProject : {
        type : String,
    },
    projectLength : {
        type : String
    },
    jobStatus : {
        type : String
    },
    vacancy : {
        type : String
    },
    location : {
        type : String
    },
    experience : {
        type : String
    },
    salary : {
        type : String
    },
    deadline : {
        type : String
    },
    publishedOn : {
        type : Date,
        default : Date.now
    },
    skills : {
        type : [String],
        required : true
    },
    apply : [
        {
        user: {
            type: Schema.Types.ObjectId,
            ref: "users",
            }
        }
    ],
    activate : {
        type : Boolean,
        default : false
    }
})
module.exports = Work = mongoose.model("work", WorkSchema);