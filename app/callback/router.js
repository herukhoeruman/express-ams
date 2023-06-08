const express = require("express");
const router = express.Router();
const { index } = require("./controller");

/* GET home page. */
router.post("/", index);

module.exports = router;
