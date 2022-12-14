const router = require("express").Router();

const userController = require("../Controllers/userController.js");
router.post("/userLogin", userController.userLogin);
router.post("/userRegister", userController.userRegister);
router.post("/userIsLogin", userController.userLoginRepeat);
module.exports = router;