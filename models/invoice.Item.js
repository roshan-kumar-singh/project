const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Item extends Model {
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

    Item.init(
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
            description: {
                type: DataTypes.TEXT,
            },
            unit: {
                type: DataTypes.STRING,
            },
            price: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            tax_type: {
                type: DataTypes.BOOLEAN,
            },
            hsnCode: {
                type: DataTypes.INTEGER,
            },
            sac_code:{
                type: DataTypes.INTEGER,
            },
            brand: {
                type: DataTypes.STRING,
            },
            tax_amount: {
                type: DataTypes.INTEGER,
            },
        },
        {
            sequelize,
            tableName: 'Item',
            modelName: 'Item',
        }
    );

    return Item;
};
