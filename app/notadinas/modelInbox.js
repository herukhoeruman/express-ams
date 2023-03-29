const mongoose = require("mongoose");

const notaDinasInboxSchema = mongoose.Schema({
  username: { type: String },
  pengirim: { type: String },
  penerima: [
    {
      type: String,
    },
  ],
  notaDinasKode: { type: String },
  sentKode: { type: String },
  disposisi: [
    {
      type: String,
    },
  ],
  tindakLanjut: { type: String },
  flagRead: { type: String },
  flagDone: { type: String },
  tanggal: { type: String },
});

module.exports = mongoose.model("NotaDinasInbox", notaDinasInboxSchema);
