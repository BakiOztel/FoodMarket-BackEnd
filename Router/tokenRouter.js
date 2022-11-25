const router = require("express").Router();
const refreshTokenController = require("../Controllers/refreshTokenController.js");

router.get("/refresh", refreshTokenController.refreshTokenHandler);

module.exports = router;