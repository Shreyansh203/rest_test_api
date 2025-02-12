import User from '../models/User.js';
import Rider from '../models/Rider.js';
import Customer from '../models/Customer.js';
import RestaurantManager from '../models/RestaurantManager.js';

import bcrypt from 'bcrypt';

 import sequelize from '../config/mysql.js'; 

export const signUp = async (req, res) => {
    const { userEmail, phoneNumber, first_name, last_name, password, role } = req.body;

    if (!userEmail || !password || !role) {
        return res.status(400).send('Incomplete or wrong details');
    }

    const t = await sequelize.transaction(); // Create a transaction object

    try {

        let existingUser = await User.findOne({ where: { email: userEmail }, transaction: t });

        if (existingUser) {
            await t.rollback(); // Rollback if the user already exists
            return res.status(400).send('Already exists');
        }

       

        // Hash the password and create the user
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        existingUser = await User.create(
            {
                email: userEmail,
                phoneNumber,
                first_name,
                last_name,
                password: hashedPassword
            },
            { transaction: t } // Specify the transaction
        );
        let roleDetails;
        switch (role.toUpperCase()) {
            case 'CUSTOMER':
                roleDetails = (await Customer.findOrCreate({ where: { userEmail: userEmail }, transaction: t }))[0];
                break;
            case 'RIDER':
                roleDetails = (await Rider.findOrCreate({ where: { userEmail: userEmail }, transaction: t }))[0];
                break;
            case 'RESTAURANT_MANAGER':
                // If the role is restaurant manager, ensure a restaurant ID is provided (if necessary)
                // if (!restaurantId) {
                //     await t.rollback(); // Rollback if missing restaurant ID
                //     return res.status(400).send('Restaurant ID is required for Restaurant Manager role');
                // }
                roleDetails = (await RestaurantManager.findOrCreate({ where: { userEmail: userEmail }, transaction: t }))[0];
                break;
            default:
                await t.rollback(); // Rollback for invalid role
                return res.status(400).send('Invalid role provided');
        }
        throw new Error('Test error');

        const responseData = {
            userEmail: existingUser.email,
            phoneNumber: existingUser.phoneNumber,
            first_name: existingUser.first_name,
            last_name: existingUser.last_name,
            role: role.toUpperCase(),
            roleDetails
        };
        // Commit the transaction
        await t.commit();
        res.status(201).send(responseData);
    } catch (err) {
        await t.rollback(); // Rollback the transaction in case of any errors
        res.status(400).send('Error: ' + err.message);
    }
};



export const linkRestid = async (req, res) => {
    const { restaurantId } = req.body; 
    const { userEmail } = req.params; 

    try {
        
        const restaurantManager = await RestaurantManager.findOne({
            where: {
                userEmail
            },
        });

        if (!restaurantManager) {
             return res.status(404).json({error: 'No matching record found '});
        }
        else if(restaurantManager.restaurantId){
            return res.status(400).json({error: 'Restaurant ID already exists'});
        }
        restaurantManager.restaurantId = restaurantId;
        await restaurantManager.save();
        let existingUser = await User.findOne({ where: { email: userEmail } });
        let roleDetails = (await RestaurantManager.findOrCreate({ where: { userEmail: userEmail } }))[0];
        const responseData = {
            userEmail: existingUser.email,
            phoneNumber: existingUser.phoneNumber,
            first_name: existingUser.first_name,
            last_name: existingUser.last_name,
            role: 'RESTAURANT_MANAGER',
            roleDetails
        };

        res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).json({
            error: error.message,
        });
    }
};


export const login = async (req, res) => {
    const { userEmail, password, role } = req.body;

    if (!userEmail || !password || !role) {
        return res.status(400).json({error: 'Incomplete or wrong details'});
    }

    try {
        const user = await User.findOne({ where: { email: userEmail } });

        if (!user) {
            return res.status(401).json({error: 'Invalid email or password'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({error: 'Invalid email or password'});
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
                return res.status(400).json({error: 'Invalid role provided'});
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
            return res.status(401).json({error: 'User does not exist for any valid role'});
        }
    } catch (err) {
        res.status(500).json({error:  err.message});
    }
};

export const changePassword = async (req, res) => {
    const { userEmail, currentPassword, newPassword } = req.body;


    console.log(userEmail, currentPassword, newPassword); 

    if (!userEmail || !newPassword || !currentPassword) {
        return res.status(400).json({error: 'Incomplete details'});
    }

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({error: 'Invalid email or password'});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.update({ password: hashedPassword }, { where: { email: userEmail } });

        res.status(200).json({message: 'Password changed successfully'});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};


export const getProfile = async (req, res) => {
    const { userEmail } = req.params;
    const { role } = req.body;
    try {
        const user = await User.findOne({ where: { email: userEmail } });

        if (!user) {
            return res.status(404).json({error: 'Profile not found'});
        }

        let roleDetails;
        switch (role.toUpperCase()) {
            case 'CUSTOMER':
                roleDetails = await Customer.findOne({ where: { userEmail } });
                break;
            case 'RIDER':
                roleDetails = await Rider.findOne({ where: { userEmail } });
                break;
            case 'RESTAURANT_MANAGER':
                roleDetails = await RestaurantManager.findOne({ where: { userEmail } });
                break;
            default:
                return res.status(400).json({error: 'Invalid role provided'});
        }

        if(!roleDetails) {
            return res.status(404).json({
                error: "user not found"
            });
        }

        const responseData = {
            email: user.email,
            phoneNumber: user.phoneNumber,
            first_name: user.first_name,
            last_name: user.last_name,
            role: role.toUpperCase(),
            roleDetails
        };

        res.status(200).json(responseData);
    } catch (err) {
        res.status(500).json({error:  err.message});
    }
};


export const updateProfile = async (req, res) => {
    const { userEmail } = req.params;

    const allowedUpdates = ["first_name", "last_name"];
    const updates = Object.keys(req.body).filter((update) => allowedUpdates.includes(update));
    const updatedDetails = updates.reduce((acc, update) => {
        acc[update] = req.body[update];
        return acc;
    }, {});

    try {
        await User.update(updatedDetails, { where: { email: userEmail } });
        const updatedUser = await User.findOne({ where: { email: userEmail } });
        const { password, ...userWithoutPassword } = updatedUser.dataValues;
        res.status(200).send(userWithoutPassword);
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
};
