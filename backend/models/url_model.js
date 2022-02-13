const mongoose = require("mongoose");
const { timestampOptions } = require("../config/conf");

const UrlSchema = new mongoose.Schema(
  {
    alias: {
      type: String,
      required: true,
      unique: true,
    },
    full: {
      type: String,
      required: true,
    },
  },
  timestampOptions
);

module.exports = mongoose.model("Url", UrlSchema);
