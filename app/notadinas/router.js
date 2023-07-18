const express = require("express");
const router = express.Router();
const multer = require("multer");
const os = require("os");
const {
  index,
  terkirim,
  viewCreate,
  actionCreate,
  viewEdit,
  actionEdit,
  insertNotaDinasSent,
  insertNotaDinasInbox,
  konsepNotaDinas,
  savePdf,
  setSign,
  kirim,
  persetujuan,
  viewPersetujuan,
  updateNotaDinas,
  actionPersetujuan,
} = require("./controller");

const { isLogin } = require("../middleware/auth");
router.use(isLogin);

/* GET home page. */
router.get("/", index); //masuk
router.get("/terkirim", terkirim);
router.get("/persetujuan", persetujuan);
router.get("/persetujuan/:id", viewPersetujuan);
router.put(
  "/update/:id",
  multer({ dest: os.tmpdir() }).single("file"),
  updateNotaDinas
);
router.put("/persetujuan/:id", actionPersetujuan);

router.get("/create", viewCreate);
router.post("/create", actionCreate);
router.get("/edit/:id", viewEdit);
router.put(
  "/edit/:id",
  multer({ dest: os.tmpdir() }).single("files"),
  actionEdit
);
router.post("/disposisi/:id", insertNotaDinasSent);
router.post("/notadinas-inbox", insertNotaDinasInbox);

router.get("/konsep", konsepNotaDinas);
router.post("/konsep", savePdf);
router.post("/kirim", multer({ dest: os.tmpdir() }).single("file"), kirim);

module.exports = router;
