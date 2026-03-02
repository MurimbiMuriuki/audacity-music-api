var express = require("express");
var router = express.Router();
const playListSongController = require("../controller/playListSong.controller");
var { authJwt } = require("../middleware");
const upload = require("../../../config/multer");


router.post("/playListSong/addPlaylistSong", playListSongController.addPlaylistSong);
router.get("/playListSong/getAllSongsByPlaylist", playListSongController.getAllSongsByPlaylist);


module.exports = router;