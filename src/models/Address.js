import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';
import User from './User.js';

const Address = sequelize.define('Address', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { 
        type: DataTypes.STRING, 
        references: { 
            model: User, 
            key: 'email' 
        },
        allowNull: false
    },
    addressLine1: DataTypes.TEXT,
    addressLine2: DataTypes.TEXT,
    tag: DataTypes.STRING,  // 'HOME', 'OFFICE', 'OTHER'
    locationCoordinates: DataTypes.STRING,
    city: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
}, {
    timestamps: false,
    foreignKey: 'userId',
    onDelete: 'CASCADE',  // Optional: to delete addresses when user is deleted
    onUpdate: 'CASCADE', 
});

export default Address;

