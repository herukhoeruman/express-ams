const express = require("express");
const router = express.Router();
const {
  index,
  viewCreate,
  actionCreate,
  viewEdit,
  actionEdit,
  insertNotaDinasSent,
  insertNotaDinasInbox,
} = require("./controller");

const { isLogin } = require("../middleware/auth");
router.use(isLogin);

/* GET home page. */
router.get("/", index);
router.get("/create", viewCreate);
router.post("/create", actionCreate);
router.get("/edit/:id", viewEdit);
router.put("/edit/:id", actionEdit);
router.post("/notadinas-sent", insertNotaDinasSent);
router.post("/notadinas-inbox", insertNotaDinasInbox);

module.exports = router;
