var express = require("express");
var router = express.Router();
const adminDashboardController = require("../controller/adminDashboard.controller");
var { authJwt } = require("../middleware");
const upload = require("../../../config/multer");


router.get("/admin/getAllAdminDashboard",[authJwt.verifyToken, authJwt.isAdmin], adminDashboardController.getAllAdminDashboard);
router.get("/admin/getAllSubscribers",[authJwt.verifyToken, authJwt.isAdmin], adminDashboardController.getAllSubscribers);
router.get("/admin/getAllUploadedSongs",[authJwt.verifyToken, authJwt.isAdmin], adminDashboardController.getAllUploadedSongs);
router.delete("/admin/deleteSong",[authJwt.verifyToken, authJwt.isAdmin], adminDashboardController.deleteSong);

// Get artist streams and payouts
router.get("/admin/getArtistStreams",[authJwt.verifyToken, authJwt.isAdmin], adminDashboardController.getArtistStreams);
// Get monthly streams for payout (query: ?month=3&year=2026)
router.get("/admin/getMonthlyStreams",[authJwt.verifyToken, authJwt.isAdmin], adminDashboardController.getMonthlyStreams);
// Export CSV for payout
router.get("/admin/exportArtistStreamsCsv",[authJwt.verifyToken, authJwt.isAdmin], adminDashboardController.exportArtistStreamsCsv);


module.exports = router;