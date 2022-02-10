"use strict";
const validateMatchJSON = require("../util/validateMatchJSON");

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("MatchStats", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            users: {
                type: Sequelize.JSON,
                allowNull: false,
                validate: {
                    isProper(value) {
                        if (!validateMatchJSON(value)) {
                            throw new Error("Malformed match user JSON");
                        }
                    },
                },
            },
            winner: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            letterCount: {
                type: Sequelize.INTEGER,
                allowNull: false,
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
        await queryInterface.dropTable("MatchStats");
    },
};
