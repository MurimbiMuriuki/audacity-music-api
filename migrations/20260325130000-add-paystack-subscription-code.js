"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("subscriptions", "paystack_subscription_code", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn("subscriptions", "paystack_email_token", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("subscriptions", "paystack_subscription_code");
    await queryInterface.removeColumn("subscriptions", "paystack_email_token");
  },
};
