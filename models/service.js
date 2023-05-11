const { Model } = require('sequelize');

// const a = {
//     serviceName: '',
//     serviceType: '',
//     description: '',
//     price: 0,
//     gst: 0.0,
//     docs: [
//         {
//             title: '',
//             type: 'file|input',
//             description: '',
//             shortName: '',
//             mandatory: true,
//         },
//     ],
// };

module.exports = (sequelize, DataTypes) => {
    class Service extends Model {}

    Service.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            serviceName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            serviceType: {
                type: DataTypes.STRING,
            },
            imgUrl: {
                type: DataTypes.STRING(1000),
            },
            description: {
                type: DataTypes.TEXT,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            gst: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            documents: {
                type: DataTypes.JSON,
                allowNull: false,
            },
        },
        {
            sequelize,
            timestamps: false,
            // tableName: 'services',
        }
    );

    return Service;
};
