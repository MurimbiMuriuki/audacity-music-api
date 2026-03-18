'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('subscriptions', ['paystack_reference'], {
      unique: true,
      name: 'unique_paystack_reference',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('subscriptions', 'unique_paystack_reference');
  }
};
