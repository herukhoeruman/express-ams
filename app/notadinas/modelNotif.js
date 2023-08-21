const mongoose = require("mongoose");

const notifSchema = mongoose.Schema(
  {
    notaDinasId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NotaDinas",
      required: true,
    },
    pengirim: String,
    pemeriksa: String,
    dari: String,
    kepada: String,
    readStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notif", notifSchema);
