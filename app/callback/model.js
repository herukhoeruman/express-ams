const mongoose = require("mongoose");
// const autoIncrement = require("mongoose-auto-increment");

let callbackSchema = mongoose.Schema(
  {
    trxId: { type: String },
    json: { type: String },
    status: { type: String },
    code: { type: String },
    documentId: { type: String },
    signerName: { type: String },
    signerEmail: { type: String },
    email: { type: String },
    url: { type: String },
    documentFileName: { type: String },
    documentOwnerName: { type: String },
    documentOwnerEmail: { type: String },
    downloadUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Callback", callbackSchema);
