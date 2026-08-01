const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return !/\d/.test(v);
      },
      message: "Title cannot contain numbers",
    },
  },

  description: {
    type: String,
    required: true,
  },

  image: {
    url:String,
    filename:String,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  location: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return !/\d/.test(v);
      },
      message: "Location cannot contain numbers",
    },
  },
  
  country: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return !/\d/.test(v);
      },
      message: "Country cannot contain numbers",
    },
  },
  category: {
  type: String,
  enum: [
    "trending",
    "rooms",
    "cities",
    "beach",
    "cabin",
    "mountains",
    "castles",
    "pools",
    "camping",
    "farms",
    "igloo"
  ],
  default: "trending",
},
  latitude: {
  type: Number,
  default: 28.6139
},

longitude: {
  type: Number,
  default: 77.2090
},

});

module.exports = mongoose.model("Listing", listingSchema);