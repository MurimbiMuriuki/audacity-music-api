var express = require("express");
var router = express.Router();

router.use(require("./auth.routes"));
router.use(require("./song.routes"));
router.use(require("./playList.routes"));
router.use(require("./playListSong.routes"));
router.use(require("./adminDashboard.routes"));
router.use(require("./contact.routes"));

module.exports = router;
