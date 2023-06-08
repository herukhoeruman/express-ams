const mongoose = require("mongoose");

const RequestSchema = mongoose.Schema({
  trxId: { type: String },
  document: { type: String },
  signature: { type: String },
  ematerai: { type: String },
  estamp: { type: String },
  clientId: { type: String },
  crn: { type: String },
  timestamp: { type: String },
});

module.exports = mongoose.model("Request", RequestSchema);
