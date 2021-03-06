"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class SoloStat extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    SoloStat.init(
        {
            user_id: DataTypes.INTEGER,
            guesses: DataTypes.INTEGER,
            letterCount: DataTypes.INTEGER,
            win: DataTypes.BOOLEAN,
        },
        {
            sequelize,
            modelName: "SoloStat",
        }
    );
    return SoloStat;
};
