'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "name", {
        type: Sequelize.STRING,
    });
    await queryInterface.changeColumn("Users", "email", {
        type: Sequelize.STRING,
    });
  }
};
