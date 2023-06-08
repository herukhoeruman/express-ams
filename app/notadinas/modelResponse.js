const mongoose = require("mongoose");

const ResponseSchema = mongoose.Schema({
  trxId: String,
  json: String,
  ref_id: String,
  code: String,
  timestamp: Date,
  message: String,
  data: {
    id: String,
    stamp: Array,
    sign: [
      {
        teken_id: String,
        email: String,
        url: String,
      },
    ],
  },
});

module.exports = mongoose.model("Response", ResponseSchema);
