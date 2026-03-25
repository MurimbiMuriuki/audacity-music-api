const crypto = require('crypto');
const subscriptionServices = require("../services/subscription.service");
const { PLAN_PRICES, SUBSCRIPTION_STATUS, PLAN_NAMES } = require('../helper/constants');
const paystackAPI = require('../../../config/paystack');
const db = require("../models");

// Helper: create subscription inside a transaction with idempotency
async function activateSubscription(user_id, plan_name, reference, paystackSubscriptionCode, paystackEmailToken, paystackCustomerCode) {
  // Idempotency: check if this reference was already used
  const existing = await db.subscriptionObj.findOne({
    where: { paystack_reference: reference }
  });
  if (existing) {
    return { alreadyProcessed: true, subscription: existing };
  }

  const billingDate = new Date();
  if (plan_name === PLAN_NAMES.ANNUAL) {
    billingDate.setFullYear(billingDate.getFullYear() + 1);
  } else {
    billingDate.setMonth(billingDate.getMonth() + 1);
  }

  // Wrap expire + create in a DB transaction
  const subscription = await db.dbObj.transaction(async (t) => {
    await db.subscriptionObj.update(
      { status: SUBSCRIPTION_STATUS.EXPIRED },
      { where: { user_id, status: SUBSCRIPTION_STATUS.ACTIVE }, transaction: t }
    );

    return await db.subscriptionObj.create({
      user_id,
      plan_name,
      billing_date: billingDate.toISOString().slice(0, 10),
      status: SUBSCRIPTION_STATUS.ACTIVE,
      paystack_reference: reference,
      paystack_subscription_code: paystackSubscriptionCode || null,
      paystack_email_token: paystackEmailToken || null,
      paystack_customer_code: paystackCustomerCode || null,
    }, { transaction: t });
  });

  return { alreadyProcessed: false, subscription };
}

module.exports = {
  // ── Admin CRUD (protected by auth + admin check in routes) ──

  async addSubscription(req, res) {
    try {
      const { user_id, plan_name, billing_date, status } = req.body;

      if (!user_id || !plan_name || !billing_date) {
        return res.status(400).json({
          success: false,
          message: "user_id, plan_name and billing_date are required",
        });
      }

      const result = await subscriptionServices.createSubscription({
        user_id, plan_name, billing_date, status: status || "active",
      });

      return res.status(201).json({
        success: true,
        message: "Subscription added successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Server error" });
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
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },

  async getByIdSubscription(req, res) {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ success: false, message: "id is required" });
      }

      const result = await subscriptionServices.getByIdSubscription(id);
      if (!result) {
        return res.status(404).json({ success: false, message: "Subscription not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Subscription fetched successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },

  async deleteSubscription(req, res) {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ success: false, message: "id is required" });
      }

      const deleted = await subscriptionServices.deleteSubscription(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Subscription not found" });
      }

      return res.status(200).json({ success: true, message: "Subscription deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },

  async updateSubscription(req, res) {
    try {
      const { id } = req.query;
      const { user_id, plan_name, billing_date, status } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: "id is required" });
      }

      let updateData = {};
      if (user_id !== undefined) updateData.user_id = user_id;
      if (plan_name !== undefined) updateData.plan_name = plan_name;
      if (billing_date !== undefined) updateData.billing_date = billing_date;
      if (status !== undefined) updateData.status = status;

      const updated = await subscriptionServices.updateSubscription(id, updateData);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Subscription not found" });
      }

      return res.status(200).json({ success: true, message: "Subscription updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ── User endpoints ──

  // GET /subscription/my — get current user's active subscription (with billing_date expiry check)
  async getMySubscription(req, res) {
    try {
      const user_id = req.userId;
      const subscription = await subscriptionServices.getLatestByUserId(user_id);

      if (!subscription) {
        return res.status(200).json({
          status: true,
          message: 'No active subscription',
          data: { hasActiveSubscription: false }
        });
      }

      const today = new Date().toISOString().slice(0, 10);

      // If already expired status, no active subscription
      if (subscription.status === SUBSCRIPTION_STATUS.EXPIRED) {
        return res.status(200).json({
          status: true,
          message: 'No active subscription',
          data: { hasActiveSubscription: false }
        });
      }

      // Check if billing_date has passed — applies to both active and cancelled
      if (subscription.billing_date < today) {
        await db.subscriptionObj.update(
          { status: SUBSCRIPTION_STATUS.EXPIRED },
          { where: { id: subscription.id } }
        );
        return res.status(200).json({
          status: true,
          message: 'Subscription expired',
          data: { hasActiveSubscription: false }
        });
      }

      // Cancelled but billing_date not reached — still usable
      if (subscription.status === SUBSCRIPTION_STATUS.CANCELLED) {
        return res.status(200).json({
          status: true,
          message: 'Subscription cancelled but active until billing date',
          data: {
            hasActiveSubscription: true,
            isCancelled: true,
            expiresOn: subscription.billing_date,
            subscription
          }
        });
      }

      return res.status(200).json({
        status: true,
        message: 'Active subscription found',
        data: { hasActiveSubscription: true, isCancelled: false, subscription }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, message: 'Server error', data: {} });
    }
  },

  // POST /subscription/cancel — cancel subscription on Paystack + locally (stays active until billing_date)
  async cancelSubscription(req, res) {
    try {
      const user_id = req.userId;

      // Find the active subscription first (before cancelling locally)
      const activeSub = await db.subscriptionObj.findOne({
        where: { user_id, status: SUBSCRIPTION_STATUS.ACTIVE },
        order: [["billing_date", "DESC"]],
      });

      if (!activeSub) {
        return res.status(404).json({
          status: false,
          message: 'No active subscription found to cancel',
        });
      }

      // Disable subscription on Paystack if we have the subscription code
      if (activeSub.paystack_subscription_code) {
        try {
          await paystackAPI.post('/subscription/disable', {
            code: activeSub.paystack_subscription_code,
            token: activeSub.paystack_email_token,
          });
          console.log(`[Cancel] Disabled Paystack subscription: ${activeSub.paystack_subscription_code}`);
        } catch (paystackErr) {
          console.error('[Cancel] Paystack disable failed:', paystackErr.response?.data || paystackErr.message);
          // If Paystack fails, we still want to cancel locally so user isn't stuck
          // but warn in logs for manual follow-up
        }
      } else {
        console.warn(`[Cancel] No paystack_subscription_code for subscription ${activeSub.id}, skipping Paystack disable`);
      }

      // Cancel locally — mark as cancelled, plan stays active until billing_date
      const subscription = await subscriptionServices.cancelSubscription(user_id);

      return res.status(200).json({
        status: true,
        message: `Subscription cancelled. Your plan remains active until ${subscription.billing_date}`,
        data: {
          subscription,
          expiresOn: subscription.billing_date,
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, message: 'Server error' });
    }
  },

  // GET /subscription/plans
  async getPlans(_req, res) {
    return res.status(200).json({
      status: true,
      message: 'Plans fetched successfully',
      data: Object.entries(PLAN_PRICES).map(([plan_name, details]) => ({
        plan_name,
        ...details
      }))
    });
  },

  // POST /subscription/verify — client calls after successful Paystack payment
  async verifyPayment(req, res) {
    try {
      const { reference } = req.body;
      const user_id = req.userId;

      if (!reference) {
        return res.status(400).json({
          status: false, message: 'Reference is required', data: {}
        });
      }

      // Verify with Paystack
      const response = await paystackAPI.get(`/transaction/verify/${reference}`);
      const data = response.data.data;

      if (data.status !== 'success') {
        return res.status(400).json({
          status: false, message: 'Payment failed. Please try again', data: {}
        });
      }

      const { plan_name } = data.metadata;

      // Verify amount matches plan price
      const plan = PLAN_PRICES[plan_name];
      if (!plan || data.amount < plan.amount) {
        return res.status(400).json({
          status: false,
          message: 'Payment amount does not match the plan price',
          data: {}
        });
      }

      // Verify the payment belongs to the authenticated user
      if (data.metadata.user_id && data.metadata.user_id !== user_id) {
        return res.status(403).json({
          status: false, message: 'Payment does not belong to this user', data: {}
        });
      }

      // Fetch Paystack subscription code using customer code from transaction
      let paystackSubCode = null;
      let paystackEmailToken = null;
      const customerCode = data.customer?.customer_code;

      if (customerCode) {
        try {
          const subListRes = await paystackAPI.get(`/subscription?customer=${data.customer.id}`);
          const subscriptions = subListRes.data?.data;
          if (subscriptions && subscriptions.length > 0) {
            // Get the most recent active subscription
            const latestSub = subscriptions[0];
            paystackSubCode = latestSub.subscription_code || null;
            paystackEmailToken = latestSub.email_token || null;
          }
        } catch (subErr) {
          console.error('[Verify] Could not fetch Paystack subscription details:', subErr.message);
        }
      }

      const result = await activateSubscription(user_id, plan_name, reference, paystackSubCode, paystackEmailToken, customerCode);

      if (result.alreadyProcessed) {
        return res.status(200).json({
          status: true,
          message: 'Subscription already activated',
          data: {
            plan_name: result.subscription.plan_name,
            billing_date: result.subscription.billing_date,
            status: result.subscription.status,
          }
        });
      }

      return res.status(200).json({
        status: true,
        message: 'Payment successful! Subscription activated',
        data: {
          plan_name: result.subscription.plan_name,
          billing_date: result.subscription.billing_date,
          status: result.subscription.status,
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
  },

  // POST /subscription/webhook — Paystack webhook (primary payment confirmation)
  async paystackWebhook(req, res) {
    try {
      // Validate signature
      const secret = process.env.PAYSTACK_SECRET_KEY;
      const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== req.headers['x-paystack-signature']) {
        return res.status(401).json({ message: 'Invalid signature' });
      }

      // Return 200 immediately (Paystack requires quick response)
      res.status(200).json({ message: 'Webhook received' });

      // Process asynchronously
      const { event, data } = req.body;

      if (event === 'charge.success') {
        const { reference, metadata, amount, customer } = data;
        const { user_id, plan_name, subscription_code, email_token } = metadata || {};

        if (!user_id || !plan_name) return;

        // Verify amount matches plan
        const plan = PLAN_PRICES[plan_name];
        if (!plan || amount < plan.amount) return;

        await activateSubscription(user_id, plan_name, reference, subscription_code, email_token, customer?.customer_code);
        console.log(`[Webhook] Subscription activated for user ${user_id}, plan: ${plan_name}`);
      }

      // Handle subscription.create — store subscription code for future cancellation
      if (event === 'subscription.create') {
        const { subscription_code, email_token, customer } = data;
        const customerCode = customer?.customer_code;

        if (subscription_code && customerCode) {
          // Find the latest active subscription for this customer and update with Paystack codes
          const sub = await db.subscriptionObj.findOne({
            where: { paystack_customer_code: customerCode, status: SUBSCRIPTION_STATUS.ACTIVE },
            order: [['id', 'DESC']],
          });
          if (sub) {
            await db.subscriptionObj.update(
              { paystack_subscription_code: subscription_code, paystack_email_token: email_token },
              { where: { id: sub.id } }
            );
            console.log(`[Webhook] Stored subscription_code ${subscription_code} for sub ${sub.id}`);
          }
        }
      }

      // Handle subscription.disable — Paystack confirms cancellation
      if (event === 'subscription.not_renew') {
        const { subscription_code } = data;
        if (subscription_code) {
          await db.subscriptionObj.update(
            { status: SUBSCRIPTION_STATUS.CANCELLED, cancelled_at: new Date() },
            { where: { paystack_subscription_code: subscription_code, status: SUBSCRIPTION_STATUS.ACTIVE } }
          );
          console.log(`[Webhook] Subscription ${subscription_code} marked as cancelled`);
        }
      }
    } catch (err) {
      console.error('Webhook error:', err.message);
      // Already sent 200, nothing to return
    }
  }
};
