var express = require("express");
var router = express.Router();
const adminDashboardController = require("../controller/adminDashboard.controller");
var { authJwt } = require("../middleware");
const upload = require("../../../config/multer");


router.get("/admin/getAllAdminDashboard",[authJwt.verifyToken], adminDashboardController.getAllAdminDashboard);
router.get("/admin/getAllSubscribers",[authJwt.verifyToken], adminDashboardController.getAllSubscribers);
router.get("/admin/getAllUploadedSongs",[authJwt.verifyToken], adminDashboardController.getAllUploadedSongs);
router.delete("/admin/deleteSong",[authJwt.verifyToken], adminDashboardController.deleteSong);

// Get artist streams and payouts
router.get("/admin/getArtistStreams",[authJwt.verifyToken], adminDashboardController.getArtistStreams);
// Get monthly streams for payout (query: ?month=3&year=2026)
router.get("/admin/getMonthlyStreams",[authJwt.verifyToken], adminDashboardController.getMonthlyStreams);
// Export CSV for payout
router.get("/admin/exportArtistStreamsCsv",[authJwt.verifyToken], adminDashboardController.exportArtistStreamsCsv);


module.exports = router;