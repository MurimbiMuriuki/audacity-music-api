var express = require("express");
var router = express.Router();
const playListController = require("../controller/playList.controller");
var { authJwt } = require("../middleware");
const upload = require("../../../config/multer");


router.post("/playList/addPlaylist", upload.single("playlistCover"),playListController.addPlaylist);
router.get("/playlist/getAllPlayList", playListController.getAllPlayList);

module.exports = router;