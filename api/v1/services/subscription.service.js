var commonHelper = require("../helper/common.helper");
const logger = require("../../../config/winston");
const db = require("../models");

module.exports = {
  /*createSubscription*/
  async createSubscription(postData) {
    try {
      let subscription = await db.subscriptionObj.create(postData);
      return subscription;
    } catch (e) {
      logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
      throw e;
    }
  },
  /*getAllSubscription*/
  async getAllSubscription(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const result = await db.subscriptionObj.findAndCountAll({
        limit,
        offset,
        order: [["id", "DESC"]],
      });

      return {
        subscriptions: result.rows,
        total: result.count,
        page,
        limit,
      };
    } catch (e) {
      logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
      throw e;
    }
  },
  /*getByIdSubscription*/
  async getByIdSubscription(id) {
    try {
      let subscription = await db.subscriptionObj.findByPk(id);
      return subscription;
    } catch (e) {
      logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
      throw e;
    }
  },
  /*getLatestByUserId*/
  async getLatestByUserId(userId) {
    try {
      return await db.subscriptionObj.findOne({
        where: { user_id: userId },
        order: [
          ["billing_date", "DESC"],
          ["id", "DESC"],
        ],
        raw: true,
      });
    } catch (e) {
      logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
      throw e;
    }
  },
  /*deleteSubscription*/
  async deleteSubscription(id) {
    try {
      const deletedRows = await db.subscriptionObj.destroy({
        where: { id },
      });
      return deletedRows > 0;
    } catch (e) {
      logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
      throw e;
    }
  },
  /*cancelSubscription — mark as cancelled but keep active until billing_date*/
  async cancelSubscription(userId) {
    try {
      const subscription = await db.subscriptionObj.findOne({
        where: { user_id: userId, status: 'active' },
        order: [["billing_date", "DESC"]],
      });

      if (!subscription) return null;

      await db.subscriptionObj.update(
        { status: 'cancelled', cancelled_at: new Date() },
        { where: { id: subscription.id } }
      );

      return await db.subscriptionObj.findByPk(subscription.id, { raw: true });
    } catch (e) {
      logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
      throw e;
    }
  },
  /*updateSubscription*/
  async updateSubscription(id, updateData) {
    try {
      const [updatedRows] = await db.subscriptionObj.update(updateData, {
        where: { id },
      });
      return updatedRows > 0;
    } catch (e) {
      logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
      throw e;
    }
  },
};
