"use strict";
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("SoloStats", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            user_id: {
                type: Sequelize.INTEGER,
                references: { model: "Users", key: "id" },
                onDelete: "cascade",
            },
            guesses: {
                type: Sequelize.INTEGER,
            },
            win: {
                type: Sequelize.BOOLEAN,
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
        await queryInterface.dropTable("SoloStats");
    },
};
