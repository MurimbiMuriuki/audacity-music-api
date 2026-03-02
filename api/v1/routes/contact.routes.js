var express = require("express");
var router = express.Router();
const contactController = require("../controller/contact.controller");
var { authJwt } = require("../middleware");

router.post(
  "/contact/sendMessage",
  [authJwt.verifyToken, contactController.validate("sendMessage")],
  contactController.sendMessage
);

module.exports = router;
