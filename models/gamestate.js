"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GameState extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  GameState.init(
    {
      gr_id: DataTypes.INTEGER,
      user_name: DataTypes.STRING,
      win: DataTypes.BOOLEAN,
      attempts: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "GameState",
    }
  );
  return GameState;
};
