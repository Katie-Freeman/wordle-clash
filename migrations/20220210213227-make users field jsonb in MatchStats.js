"use strict";
const validateMatchJSON = require("../util/validateMatchJSON");

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn("MatchStats", "users", {
            type: Sequelize.JSONB,
            allowNull: false,
            validate: {
                isProper(value) {
                    if (!validateMatchJSON(value)) {
                        throw new Error("Malformed match user JSON");
                    }
                },
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn("MatchStats", "users", {
            type: Sequelize.JSON,
            allowNull: false,
            validate: {
                isProper(value) {
                    if (!validateMatchJSON(value)) {
                        throw new Error("Malformed match user JSON");
                    }
                },
            },
        });
    },
};
