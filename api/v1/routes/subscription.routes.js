var express = require("express");
var router = express.Router();
const subscriptionController = require("../controller/subscription.controller");
var { authJwt } = require("../middleware");

// Admin CRUD — all protected
router.post("/subscription/addSubscription", [authJwt.verifyToken], subscriptionController.addSubscription);
router.get("/subscription/getAllSubscrition", [authJwt.verifyToken], subscriptionController.getAllSubscription);
router.get("/subscription/getByIdSubscription", [authJwt.verifyToken], subscriptionController.getByIdSubscription);
router.delete("/subscription/deleteSubscription", [authJwt.verifyToken], subscriptionController.deleteSubscription);
router.put("/subscription/updateSubscription", [authJwt.verifyToken], subscriptionController.updateSubscription);

// Public
router.get("/subscription/getPlans", subscriptionController.getPlans);

// User — requires auth
router.get("/subscription/my", [authJwt.verifyToken], subscriptionController.getMySubscription);
router.post("/subscription/verify", [authJwt.verifyToken], subscriptionController.verifyPayment);

// Paystack webhook — no auth (validated via signature)
router.post("/subscription/webhook", subscriptionController.paystackWebhook);

module.exports = router;
