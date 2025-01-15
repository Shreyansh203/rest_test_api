import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

const User = sequelize.define('Users', {
    email: { type: DataTypes.STRING, primaryKey: true },
    phoneNumber: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    creationTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'creation_time' },
    lastUpdate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, onUpdate: DataTypes.NOW, field: 'last_update' },
}, {
    timestamps: false,
});

export default User;