var express = require("express");
var router = express.Router();
const songController = require("../controller/ song.controller");
var { authJwt } = require("../middleware");
const upload = require("../../../config/multer");

router.post("/song/uploadSong",upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  songController.uploadSong
);

router.get("/song/getAllUploadSong",songController.getAllUploadSong);
router.get("/song/getByIdSong", songController.getByIdSong);
router.delete("/song/deleteSong", songController.deleteSong);
router.put("/song/updateSong", upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "audio", maxCount: 1 }
]), songController.updateSong);

router.get("/song/getSongsByArtist", songController.getSongsByArtist);
router.get("/song/searchDashboard", songController.searchDashboard);

router.get("/public/getLandingPageSong", songController.getLandingPageSong);

module.exports = router;