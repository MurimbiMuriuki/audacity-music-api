var commonHelper = require("../helper/common.helper");
const authServices = require("../services/auth.services");
const contactService = require("../services/contact.service");
const { check, validationResult } = require("express-validator");

const myValidationResult = validationResult.withDefaults({
  formatter: (error) => {
    return error.msg;
  },
});

module.exports = {
  async sendMessage(req, res) {
    try {
      const errors = myValidationResult(req);
      if (!errors.isEmpty()) {
        return res.status(200).send(commonHelper.parseErrorRespose(errors.mapped()));
      }

      const { email, message } = req.body;

      const user = await authServices.getUserById(req.userId);
      if (!user) {
        throw new Error("User not found");
      }

      const authEmail = String(user.email || "").trim().toLowerCase();
      const requestEmail = String(email || "").trim().toLowerCase();

      if (authEmail && requestEmail && authEmail !== requestEmail) {
        throw new Error("Email must match logged-in account");
      }

      await contactService.sendContactMessage({
        userId: req.userId,
        userName: req.userName,
        email: user.email || email,
        message,
      });

      return res
        .status(200)
        .send(commonHelper.parseSuccessRespose({}, "Message sent successfully"));
    } catch (error) {
      return res.status(400).json({
        status: false,
        message: error.response?.data?.error || error.message || "Message send failed",
        data: error.response?.data || {},
      });
    }
  },

  validate(method) {
    switch (method) {
      case "sendMessage": {
        return [
          check("email")
            .not()
            .isEmpty()
            .withMessage("Email is required")
            .bail()
            .isEmail()
            .withMessage("Valid email is required"),
          check("message")
            .not()
            .isEmpty()
            .withMessage("Message is required")
            .bail()
            .isLength({ min: 5, max: 2000 })
            .withMessage("Message must be between 5 and 2000 characters"),
        ];
      }
    }
  },
};
