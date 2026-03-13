var express = require("express");
var router = express.Router();
const songController = require("../controller/song.controller");
var { authJwt } = require("../middleware");
const upload = require("../../../config/multer");

router.post("/song/uploadSong",[authJwt.verifyToken],upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  songController.uploadSong
);

router.get("/song/getAllUploadSong",[authJwt.verifyToken],songController.getAllUploadSong);
router.get("/song/getByIdSong", [authJwt.verifyToken],songController.getByIdSong);
router.delete("/song/deleteSong", [authJwt.verifyToken],songController.deleteSong);
router.put("/song/updateSong",[authJwt.verifyToken], upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "audio", maxCount: 1 }
]), songController.updateSong);

router.get("/song/getSongsByArtist",[authJwt.verifyToken], songController.getSongsByArtist);
router.get("/song/searchDashboard", [authJwt.verifyToken],songController.searchDashboard);

router.get("/public/getLandingPageSong", songController.getLandingPageSong);

module.exports = router;