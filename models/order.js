const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {}

    Order.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            services: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: 'pending',
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            gst: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            orderTotal: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            stateOfSupply: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            payment_id: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            payment_status: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            timestamps: true,
            // tableName: 'invoices',
            modelName: 'Order',
        }
    );

    return Order;
};
