const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class PaymentTransaction extends Model {}

    PaymentTransaction.init(
        {
            razorpay_order_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            razorpay_payment_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: 'created',
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
            modelName: 'PaymentTransaction',
        }
    );

    return PaymentTransaction;
};
