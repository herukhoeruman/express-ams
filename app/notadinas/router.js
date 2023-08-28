const express = require("express");
const router = express.Router();
const multer = require("multer");
const os = require("os");
const {
  index,
  detail,
  terkirim,
  insertNotaDinasSent,
  konsepNotaDinas,
  savePdf,
  kirim,
  persetujuan,
  viewPersetujuan,
  updateNotaDinas,
  actionPersetujuan,
  prosesKonsep,
  prosesPersetujuan,
  actionSimpanDraft,
  viewEditDraft,
  viewDraft,
  actionEditDraft,
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
router.post("/disposisi/:id", insertNotaDinasSent);

router.get("/konsep", konsepNotaDinas);
router.post("/proses-konsep", prosesKonsep);
router.post("/konsep", savePdf);
router.post("/kirim", multer({ dest: os.tmpdir() }).single("file"), kirim);

router.post(
  "/draft",
  multer({ dest: os.tmpdir() }).single("file"),
  actionSimpanDraft
);
router.get("/draft", viewDraft);
router.get("/draft/:id", viewEditDraft);
router.put("/draft/:id", actionEditDraft);

module.exports = router;
