import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

import User from './User.js';

// RestaurantManager Model
const RestaurantManager = sequelize.define(
    'RestaurantManager',
    {
        userEmail: {
            type: DataTypes.STRING,
            references: {
                model: User,
                key: 'email',
            },
            onDelete: 'CASCADE',
            allowNull: false,
            primaryKey: true
        },
        restaurantId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: false, // Disable automatic timestamp fields
        tableName: 'RestaurantManager', // Explicitly define table name
    }
);

export default RestaurantManager;