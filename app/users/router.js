const express = require("express");
const router = express.Router();
const { index, actionLogin, actionLogout } = require("./controller");

// const { countMiddleware } = require("../middleware/notadinas");
// router.use(countMiddleware);

/* GET home page. */
router.get("/", index);
router.post("/", actionLogin);
router.get("/logout", actionLogout);

module.exports = router;
