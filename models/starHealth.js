'use strict';
const {
    Model
} = require('sequelize');

var Sequelize=require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class StarHealth extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        // static associate({User}) {
        //     this.belongsTo(User,{
               
        //         foreignKey: 'user_id',
        //         targetKey: 'id',
        //         onDelete: 'CASCADE',
        //         onUpdate: 'CASCADE'
        //     })
        // }
    }

    StarHealth.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        plan_type: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        age_band: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        rs_5_lakhs: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rs_10_lakhs: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rs_15_lakhs: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rs_20_lakhs: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rs_25_lakhs: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rs_50_lakhs: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }, 
        rs_75_lakhs: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rs_1_cr: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rs_2_cr: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        sequelize,
        tableName: 'star_health', 
        modelName: 'StarHealth',
     
    });
    return StarHealth;
};
