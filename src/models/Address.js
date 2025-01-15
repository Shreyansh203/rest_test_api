import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';
import User from './User.js';

const Address = sequelize.define('Address', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.STRING, references: { model: User, key: 'email' } },
    addressLine1: DataTypes.TEXT,
    addressLine2: DataTypes.TEXT,
    tag: DataTypes.STRING,
    locationCoordinates: DataTypes.STRING,
    city: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
}, {
    timestamps: false,
});

export default Address;
