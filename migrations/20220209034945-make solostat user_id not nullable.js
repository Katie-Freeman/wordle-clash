"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn("SoloStats", "user_id", {
            type: Sequelize.INTEGER,
            references: { model: "Users", key: "id" },
            onDelete: "cascade",
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn("SoloStats", "user_id", {
            type: Sequelize.INTEGER,
            references: { model: "Users", key: "id" },
            onDelete: "cascade",
        });
    },
};
