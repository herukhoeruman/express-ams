const express = require("express");
const router = express.Router();
const multer = require("multer");
const os = require("os");
const {
  index,
  viewCreate,
  actionCreate,
  viewEdit,
  actionEdit,
  insertNotaDinasSent,
  insertNotaDinasInbox,
  konsepNotaDinas,
  reviewKonsepNotaDinas,
} = require("./controller");

const { isLogin } = require("../middleware/auth");
router.use(isLogin);

/* GET home page. */
router.get("/", index);
router.get("/create", viewCreate);
router.post("/create", actionCreate);
router.get("/edit/:id", viewEdit);
router.put(
  "/edit/:id",
  multer({ dest: os.tmpdir() }).single("files"),
  actionEdit
);
router.post("/notadinas-sent", insertNotaDinasSent);
router.post("/notadinas-inbox", insertNotaDinasInbox);
router.get("/konsep", konsepNotaDinas);
router.post("/konsep", reviewKonsepNotaDinas);

module.exports = router;
