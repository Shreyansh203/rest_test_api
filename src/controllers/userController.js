import User from '../models/User.js';
import Rider from '../models/Rider.js';
import Customer from '../models/Customer.js';
import RestaurantManager from '../models/RestaurantManager.js';

import bcrypt from 'bcrypt';

export const signUp = async (req, res) => {
    const { email, phoneNumber, first_name, last_name, password, role, restaurantId } = req.body;

    if (!email || !password || !role) {
        return res.status(400).send('Incomplete or wrong details');
    }

    try {
        let existingUser = await User.findOne({ where: { email } });
        let hashedPassword;

        if (!existingUser) {
            const saltRounds = 10;
            hashedPassword = await bcrypt.hash(password, saltRounds);

            existingUser = await User.create({
                email,
                phoneNumber,
                first_name,
                last_name,
                password: hashedPassword
            });
        }

        let roleDetails;
        switch (role.toUpperCase()) {
            case 'CUSTOMER':
                roleDetails = (await Customer.findOrCreate({ where: { userEmail: email } }))[0];
                break;
            case 'RIDER':
                roleDetails = (await Rider.findOrCreate({ where: { userEmail: email } }))[0];
                break;
            case 'RESTAURANT_MANAGER':
                if (!restaurantId) {
                    return res.status(400).send('Restaurant ID is required for Restaurant Manager role');
                }
                roleDetails = (await RestaurantManager.findOrCreate({ where: { userEmail: email, restaurantId } }))[0];
                break;
            default:
                return res.status(400).send('Invalid role provided');
        }

        console.log(roleDetails);

        const responseData = {
            email: existingUser.email,
            phoneNumber: existingUser.phoneNumber,
            first_name: existingUser.first_name,
            last_name: existingUser.last_name,
            role: role.toUpperCase(),
            roleDetails
        };

        res.status(201).send(responseData);
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
};

export const login = async (req, res) => {
    const { userEmail, password, role } = req.body;

    if (!userEmail || !password || !role) {
        return res.status(400).send('Incomplete or wrong details');
    }

    try {
        const user = await User.findOne({ where: { email: userEmail } });

        if (!user) {
            return res.status(401).send('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid email or password');
        }

        let roleExists = false;
        let roleDetails = null;

        switch (role.toUpperCase()) {
            case 'CUSTOMER':
                const customer = await Customer.findOne({ where: { userEmail } });
                if (customer) {
                    roleExists = true;
                    roleDetails = customer;
                }
                break;
            case 'RIDER':
                const rider = await Rider.findOne({ where: { userEmail } });
                if (rider) {
                    roleExists = true;
                    roleDetails = rider;
                }
                break;
            case 'RESTAURANT_MANAGER':
                const manager = await RestaurantManager.findOne({ where: { userEmail } });
                if (manager) {
                    roleExists = true;
                    roleDetails = manager;
                }
                break;
            default:
                return res.status(400).send('Invalid role provided');
        }

        if (roleExists) {
            const { password, ...userWithoutPassword } = user.dataValues;
            return res.status(200).send({
                email: userWithoutPassword.email,
                phoneNumber: userWithoutPassword.phoneNumber,
                first_name: userWithoutPassword.first_name,
                last_name: userWithoutPassword.last_name,
                creationTime: userWithoutPassword.creationTime,
                lastUpdate: userWithoutPassword.lastUpdate,
                role: role.toUpperCase(),
                roleDetails: roleDetails
            });
        } else {
            return res.status(401).send('User does not exist for any valid role');
        }
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
};

export const changePassword = async (req, res) => {
    const { userEmail, currentPassword, newPassword } = req.body;


    console.log(userEmail, currentPassword, newPassword); 

    if (!userEmail || !newPassword || !currentPassword) {
        return res.status(400).send('Incomplete details');
    }

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).send('User not found');
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid email or password');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.update({ password: hashedPassword }, { where: { email: userEmail } });

        res.status(200).send('Password changed successfully');
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
};


export const getProfile = async (req, res) => {
    const { userEmail } = req.params;
    const {role } = req.body;
    try {
        const user = await User.findOne({ where: { email: userEmail } });

        if (!user) {
            return res.status(404).send('Profile not found');
        }

        let roleDetails;
        switch (role.toUpperCase()) {
            case 'CUSTOMER':
                roleDetails = await Customer.findOne({ where: { userEmail } });
                break;
            case 'RIDER':
                roleDetails = await Rider.findOne({ where: { userEmail } });
                break;
            case 'MANAGER':
            case 'RESTAURANTMANAGER':
                roleDetails = await RestaurantManager.findOne({ where: { userEmail } });
                break;
            default:
                return res.status(400).send('Invalid role provided');
        }

        const responseData = {
            email: user.email,
            phoneNumber: user.phoneNumber,
            first_name: user.first_name,
            last_name: user.last_name,
            role: role.toUpperCase(),
            roleDetails
        };

        res.status(200).send(responseData);
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
};


export const updateProfile = async (req, res) => {
    const { userEmail } = req.params;
    const updatedDetails = req.body;

    try {
        await User.update(updatedDetails, { where: { email: userEmail } });
        const updatedUser = await User.findOne({ where: { email: userEmail } });
        res.status(200).send(updatedUser);
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
};
