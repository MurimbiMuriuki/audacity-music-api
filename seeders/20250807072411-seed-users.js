'use strict';
require('dotenv').config();
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const hashedPassword = bcrypt.hashSync(process.env.DEFAULT_PASSWORD, 10);
    await queryInterface.bulkInsert("users", [
      {
        name: process.env.DEFAULT_USERNAME,
        email: process.env.DEFAULT_EMAIL,
        password: hashedPassword, 
        phone: "9876543210",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("users", { email: "admin@gmail" });
  }
};
