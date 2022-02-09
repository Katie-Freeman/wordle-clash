"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("GameStates", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      gr_id: {
        type: Sequelize.INTEGER,
        references: { model: "GameRooms", key: "id" },
      },
      user_name: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "name" },
      },
      win: {
        type: Sequelize.BOOLEAN,
      },
      attempts: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("GameStates");
  },
};
