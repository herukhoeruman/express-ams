const mongoose = require("mongoose");

const notaDinasInboxSchema = mongoose.Schema(
  {
    pengirim: { type: String },
    penerima: { type: String },
    disposisi: [
      {
        type: String,
      },
    ],
    tindakLanjut: { type: String },
    tanggal: { type: String },
    readStatus: {
      type: Boolean,
      default: false,
    },
    notaDinasId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NotaDinas",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotaDinasInbox", notaDinasInboxSchema);
