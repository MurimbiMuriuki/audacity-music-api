var express = require("express");
var router = express.Router();
const authController = require("../controller/auth.controller");
var { authJwt } = require("../middleware");

/*register*/
router.post("/auth/register",[authController.validate("register")], authController.register);
/*getAllUser*/
router.get("/auth/getAllUser",[authJwt.verifyToken],authController.getAllUsers);
/*getUserById*/
router.get("/auth/getUserById",[authJwt.verifyToken], authController.getUserById);
/*updateUser*/
router.put("/auth/updateUser/:id",[authJwt.verifyToken], authController.updateUser);
/*deleteUser*/
router.delete("/auth/deleteUser/:id", [authJwt.verifyToken],authController.deleteUser);
/*login*/
router.post("/auth/login", authController.login);


module.exports = router;
