const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Library extends Model {}

    Library.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            pan: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            section: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            sub_section: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            subject: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            ao_order: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            itat_no: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            rsa_no: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            bench: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            appeal_no: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            appellant: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            respondent: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            appeal_type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            appeal_filed_by: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            order_result: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            tribunal_order_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            assessment_year: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            judgment: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            conclusion: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            download: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            upload: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
        },
        {
            sequelize,
            timestamps: true,
            // tableName: 'invoices',
            modelName: 'Library',
        }
    );

    return Library;
};
