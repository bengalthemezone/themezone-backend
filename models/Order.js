const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  trans_date: {
      type: String,
      required: true,
  },
  trans_id : {
    type : String,
    required : true,
  },
  amount : {
    type : String,
    required : true
  },
  card_type : {
    type : String
  }
    
})

module.exports = User = mongoose.model("Order", OrderSchema);
