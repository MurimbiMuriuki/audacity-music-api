const subscriptionServices = require("../services/subscription.service");
const { PLAN_PRICES, SUBSCRIPTION_STATUS, PLAN_NAMES } = require('../helper/constants');
const paystackAPI = require('../../../config/paystack');
const db = require("../models");
module.exports = {
  async addSubscription(req, res) {
    try {
      const { user_id, plan_name, billing_date, status } = req.body;

      if (!user_id || !plan_name || !billing_date) {
        return res.status(400).json({
          success: false,
          message: "user_id, plan_name and billing_date are required",
        });
      }

      const subscriptionData = {
        user_id,
        plan_name,
        billing_date,
        status: status || "active",
      };

      const result = await subscriptionServices.createSubscription(subscriptionData);

      return res.status(201).json({
        success: true,
        message: "Subscription added successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
  async getAllSubscription(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;

      const result = await subscriptionServices.getAllSubscription(page, limit);

      return res.status(200).json({
        success: true,
        message: "Subscriptions fetched successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
  async getByIdSubscription(req, res) {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id is required",
        });
      }

      const result = await subscriptionServices.getByIdSubscription(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Subscription fetched successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
  async deleteSubscription(req, res) {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id is required",
        });
      }

      const deleted = await subscriptionServices.deleteSubscription(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Subscription deleted successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
  async updateSubscription(req, res) {
    try {
      const { id } = req.query;
      const { user_id, plan_name, billing_date, status } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id is required",
        });
      }

      let updateData = {};

      if (user_id !== undefined) updateData.user_id = user_id;
      if (plan_name !== undefined) updateData.plan_name = plan_name;
      if (billing_date !== undefined) updateData.billing_date = billing_date;
      if (status !== undefined) updateData.status = status;

      const updated = await subscriptionServices.updateSubscription(id, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Subscription updated successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  // GET /subscription/plans
  async getPlans(req, res) {
    return res.status(200).json({
      status: true,
      message: 'Plans fetched successfully',
      data: Object.entries(PLAN_PRICES).map(([plan_name, details]) => ({
        plan_name,
        ...details
      }))
    });
  },

  // POST /subscription/initiate
 async initiatePayment(req, res) {
  try {
    const { plan_name } = req.body;
    const user_id = req.userId;

    const plan = PLAN_PRICES[plan_name];
   

    if (!plan) {
      return res.status(400).json({
        status: false,
        message: 'Invalid plan',
        data: {}
      });
    }

    const user = await db.usersObj.findByPk(user_id);
  

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
        data: {}
      });
    }

  

    const response = await paystackAPI.post('/transaction/initialize', {
      email: user.email,
      amount: plan.amount * 100,
      currency: plan.currency,
      metadata: { user_id, plan_name }
    });

    

    return res.status(200).json({
      status: true,
      message: 'Payment initiated',
      data: {
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
        plan_name,
        amount: plan.amount
      }
    });

  } catch (err) {
    
    return res.status(500).json({
      status: false,
      message: err.response?.data?.message || 'Payment initiation failed',
      data: {}
    });
  }
},
 async verifyPayment(req, res) {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({
        status: false,
        message: 'Reference is required',
        data: {}
      });
    }


    const response = await paystackAPI.get(`/transaction/verify/${reference}`);
    
    const data = response.data.data;

    if (data.status !== 'success') {
      return res.status(400).json({
        status: false,
        message: 'Payment failed. Please try again',
        data: {}
      });
    }

    const { user_id, plan_name } = data.metadata;

    const billingDate = new Date();
    if (plan_name === PLAN_NAMES.ANNUAL) {
      billingDate.setFullYear(billingDate.getFullYear() + 1);
    } else {
      billingDate.setMonth(billingDate.getMonth() + 1);
    }

  
    await db.subscriptionObj.update(
      { status: SUBSCRIPTION_STATUS.EXPIRED },
      { where: { user_id } }
    );

    
    await db.subscriptionObj.create({
      user_id,
      plan_name,
      billing_date: billingDate.toISOString().slice(0, 10),
      status: SUBSCRIPTION_STATUS.ACTIVE,
      paystack_reference: reference
    });

    return res.status(200).json({
      status: true,
      message: 'Payment successful! Subscription activated',
      data: {
        plan_name,
        billing_date: billingDate.toISOString().slice(0, 10),
        status: SUBSCRIPTION_STATUS.ACTIVE,
        next_screen: 'home'  
      }
    });

  } catch (err) {
    console.error('Verify payment error:', err.message);
    return res.status(500).json({
      status: false,
      message: err.response?.data?.message || 'Payment verification failed',
      data: {}
    });
  }
}

};
