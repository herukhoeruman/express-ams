const mongoose = require("mongoose");

const ResponseSchema = mongoose.Schema({
  json: { type: String },
  status: { type: String },
  code: { type: String },
  message: { type: String },
  document_id: { type: String },
  email: { type: String },
  url: { type: String },
});

module.exports = mongoose.model("Response", ResponseSchema);
