'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Songs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      coverUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      audioUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      duration: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
      },

      streamCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Songs');
  }
};
