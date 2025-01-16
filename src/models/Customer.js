import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

import User from './User.js';

const Customer = sequelize.define(
    'Customer',
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
    },
    {
        timestamps: false,
        tableName: 'Customer',
    }
);
export default Customer;