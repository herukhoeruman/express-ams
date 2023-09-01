const express = require("express");
const router = express.Router();
const {
  index,
  actionLogin,
  actionLogout,
  viewProfile,
  actionChangePassword,
  actionUpdateProfile,
} = require("./controller");

// const { countMiddleware } = require("../middleware/notadinas");
// router.use(countMiddleware);

/* GET home page. */
router.get("/", index);
router.post("/", actionLogin);
router.get("/logout", actionLogout);

router.get("/user/profile/:username", viewProfile);
router.put("/user/profile/:id", actionChangePassword);
router.put("/user/profile/update/:id", actionUpdateProfile);

module.exports = router;
