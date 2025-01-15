import User from '../models/User.js';
import redis from '../config/redis.js';

export const signUp = async (req, res) => {
    const { email, phoneNumber, first_name, last_name, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).send('Incomplete or wrong details');
    try {
        const newUser = await User.create({ email, phoneNumber, first_name, last_name, password, role });
        res.status(201).send(newUser);
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
};

export const login = async (req, res) => {
    const { userEmail, password } = req.body;
    if (!userEmail || !password) return res.status(400).send('Incomplete or wrong details');
    try {
        const user = await User.findOne({ where: { email: userEmail, password } });
        if (!user) return res.status(401).send('Invalid email or password');
        const authToken = Math.random().toString(36).substring(2);
        await redis.set(authToken, JSON.stringify(user), 'EX', 3600); // 1 hour
        res.status(200).send({ authToken });
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
};

export const changePassword = async (req, res) => {
    const { userEmail, newPassword } = req.body;
    const authToken = req.headers.authorization;
    if (!authToken) return res.status(401).send('Unauthorized');
    try {
        const session = await redis.get(authToken);
        if (!session) return res.status(401).send('Invalid or expired session token');
        await User.update({ password: newPassword }, { where: { email: userEmail } });
        res.status(200).send('Password changed successfully');
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
};

export const logout = async (req, res) => {
    const authToken = req.headers.authorization;

    if (!authToken) {
        return res.status(401).send('Unauthorized');
    }

    try {
        await redis.del(authToken);
        res.status(200).send('Logged out successfully');
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
};

export const getProfile = async (req, res) => {
    const { userEmail } = req.params;

    try {
        const user = await User.findOne({ where: { email: userEmail } });

        if (!user) {
            return res.status(404).send('Profile not found');
        }

        res.status(200).send(user);
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
};

// Update Profile
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