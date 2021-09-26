const mongoose = require("mongoose");

const PinSchema = new mongoose.Schema(
  {
  
    title: {
      type: String,
      required: true,
      min: 3,
      max: 60,
    },
    

    desc: {
      type: String,
      required: true,
      min: 3,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    long: {
      type: Number,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    imgCollection:{
      type: Array,
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Pin", PinSchema);
