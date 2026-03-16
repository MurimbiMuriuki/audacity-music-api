var express = require("express");
var router = express.Router();
const subscriptionController = require("../controller/subscription.controller");
var { authJwt } = require("../middleware");

router.post("/subscription/addSubscription", subscriptionController.addSubscription);
router.get("/subscription/getAllSubscrition", subscriptionController.getAllSubscription);
router.get("/subscription/getByIdSubscription", subscriptionController.getByIdSubscription);
router.delete("/subscription/deleteSubscription", subscriptionController.deleteSubscription);
router.put("/subscription/updateSubscription", subscriptionController.updateSubscription);


router.get("/subscription/getPlans", subscriptionController.getPlans);
router.post("/subscription/initiatePayment", [authJwt.verifyToken],subscriptionController.initiatePayment);
router.get("/subscription/verify", subscriptionController.verifyPayment);
module.exports = router;
