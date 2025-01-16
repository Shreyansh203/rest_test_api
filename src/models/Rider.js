import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

import User from './User.js';

const Rider = sequelize.define(
    'Rider',
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
        rating: {
            type: DataTypes.DECIMAL(3, 2),
            defaultValue: 0.0,
        },
        countOfRating: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        timestamps: false,
        tableName: 'Rider',
    }
);
export default Rider;