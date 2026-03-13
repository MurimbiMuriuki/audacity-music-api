var express = require("express");
var router = express.Router();
const playListSongController = require("../controller/playListSong.controller");
var { authJwt } = require("../middleware");
const upload = require("../../../config/multer");


router.post("/playListSong/addPlaylistSong", [authJwt.verifyToken],playListSongController.addPlaylistSong);
router.get("/playListSong/getAllSongsByPlaylist", [authJwt.verifyToken],playListSongController.getAllSongsByPlaylist);
router.delete("/playListSong/removeSong", [authJwt.verifyToken], playListSongController.removeSong);


module.exports = router;