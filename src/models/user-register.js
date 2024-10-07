'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class UserRegister extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    //object relational mapping
    UserRegister.init({
        email: DataTypes.STRING,
        code: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'UserRegister',
    });
    return UserRegister;
};