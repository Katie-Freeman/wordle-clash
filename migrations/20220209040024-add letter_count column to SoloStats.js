"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("SoloStats", "letterCount", {
            type: Sequelize.INTEGER,
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("SoloStats", "letterCount");
    },
};
