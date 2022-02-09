"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn("GameStates", "user_name", {
      type: Sequelize.STRING,
      references: { model: "Users", key: "name" },
    });
  },

  async down(queryInterface, Sequelize) {
    // return queryInterface.removeColumn("GameStates", "user_id");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
