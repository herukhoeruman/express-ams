const express = require("express");
const router = express.Router();
const { index } = require("./controller");

const { isLogin } = require("../middleware/auth");
router.use(isLogin);
const { countMiddleware } = require("../middleware/notadinas");
router.use(countMiddleware);

/* GET home page. */
router.get("/", index);
module.exports = router;
