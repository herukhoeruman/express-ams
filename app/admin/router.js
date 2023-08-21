const express = require("express");
const router = express.Router();
const { index, create, update, hapus } = require("./controller");

const { isLogin } = require("../middleware/auth");
router.use(isLogin);
const { countMiddleware } = require("../middleware/notadinas");
router.use(countMiddleware);

router.get("/", index);
router.post("/new", create);
router.put("/update/:id", update);
router.delete("/delete/:id", hapus);

module.exports = router;
