'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GameRoom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  GameRoom.init({
    letters: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'GameRoom',
  });
  return GameRoom;
};