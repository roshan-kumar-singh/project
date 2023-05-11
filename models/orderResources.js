const { Model } = require('sequelize');
const Order = require('./order');

module.exports = (sequelize, DataTypes) => {
    class OrderResource extends Model {
        // static associate(models) {
        //     this.hasOne(models.Order, {
        //         foreignKey: 'orderId',
        //     });
        // }
    }

    OrderResource.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            orderId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            fileName: {
                type: DataTypes.STRING, 
                allowNull: false,
            },
            fileType: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            url: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
            verified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize,
            timestamps: true,
            // tableName: 'invoices',
            modelName: 'OrderResource',
        }
    );

    return OrderResource;
};
