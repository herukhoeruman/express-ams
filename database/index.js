const mongoose = require("mongoose");
// import mongoose from "mongoose";
const { urlDB } = require("../config");

mongoose.connect(urlDB, {
  useUnifiedTopology: true,
  //   useFindAndModify: true,
  //   useCreateIndex: true,
});
mongoose.set("strictQuery", false);

const db = mongoose.connection;

module.exports = db;
