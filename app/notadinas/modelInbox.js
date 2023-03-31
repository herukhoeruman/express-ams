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
  flagRead: { type: Number, default: 0 },
  flagDone: { type: Number, default: 0 },
  tanggal: { type: String },
});

module.exports = mongoose.model("NotaDinasInbox", notaDinasInboxSchema);
