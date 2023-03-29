const express = require("express");
const router = express.Router();
const { insertSent } = require("./controller");

/* GET home page. */
router.post("/sent", insertSent);

module.exports = router;
