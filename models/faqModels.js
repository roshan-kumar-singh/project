'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Faq extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
      
    }

    Faq.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
          category: DataTypes.STRING,
          title: DataTypes.STRING,
          dec: DataTypes.STRING,
	
       
    }, {
        sequelize,
        tableName: 'Faq',
        modelName: 'Faq',
     
    });
    return Faq;
};