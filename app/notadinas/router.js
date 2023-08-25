const express = require("express");
const router = express.Router();
const multer = require("multer");
const os = require("os");
const {
  index,
  detail,
  terkirim,
  viewCreate,
  actionCreate,
  viewEdit,
  actionEdit,
  insertNotaDinasSent,
  insertNotaDinasInbox,
  konsepNotaDinas,
  savePdf,
  kirim,
  persetujuan,
  viewPersetujuan,
  updateNotaDinas,
  actionPersetujuan,
  prosesKonsep,
  prosesPersetujuan,
} = require("./controller");

const { isLogin } = require("../middleware/auth");
router.use(isLogin);
const { countMiddleware } = require("../middleware/notadinas");
router.use(countMiddleware);

/* GET home page. */
router.get("/", index); //masuk
router.get("/detail/:id", detail); //detail
router.get("/terkirim", terkirim);
router.get("/persetujuan", persetujuan);
router.get("/persetujuan/:id", viewPersetujuan);
router.put(
  "/update/:id",
  multer({ dest: os.tmpdir() }).single("file"),
  updateNotaDinas
);

router.post("/proses-persetujuan/:id", prosesPersetujuan);
router.put("/persetujuan/:id", actionPersetujuan);

// router.get("/create", viewCreate);
// router.post("/create", actionCreate);
// router.get("/edit/:id", viewEdit);
// router.put(
//   "/edit/:id",
//   multer({ dest: os.tmpdir() }).single("files"),
//   actionEdit
// );
// router.post("/notadinas-inbox", insertNotaDinasInbox);
router.post("/disposisi/:id", insertNotaDinasSent);

router.get("/konsep", konsepNotaDinas);
router.post("/proses-konsep", prosesKonsep);
router.post("/konsep", savePdf);
router.post("/kirim", multer({ dest: os.tmpdir() }).single("file"), kirim);

module.exports = router;
