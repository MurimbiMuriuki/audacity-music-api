var express = require("express");
var router = express.Router();
const playListController = require("../controller/playList.controller");
var { authJwt } = require("../middleware");
const upload = require("../../../config/multer");


router.post("/playList/addPlaylist", [authJwt.verifyToken],upload.single("playlistCover"),playListController.addPlaylist);
router.get("/playlist/getAllPlayList",[authJwt.verifyToken], playListController.getAllPlayList);
router.get("/playList/sharePlaylist", [authJwt.verifyToken], playListController.sharePlaylist);


module.exports = router;