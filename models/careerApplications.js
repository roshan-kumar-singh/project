const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CareerApplication extends Model {}

    CareerApplication.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            address: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            pin: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            mobile: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            skills: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
            gender: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            cv: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
        },
        {
            sequelize,
            timestamps: true,
            // tableName: 'invoices',
            modelName: 'CareerApplication',
        }
    );

    return CareerApplication;
};
