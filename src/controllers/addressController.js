import Address from '../models/Address.js';

export const addAddress = async (req, res) => {
    const { userId, addressLine1, addressLine2, tag, locationCoordinates, city, phoneNumber } = req.body;
    try {
        await Address.create({ userId, addressLine1, addressLine2, tag, locationCoordinates, city, phoneNumber });
        res.status(200).send('Address added successfully');
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
};

export const getAllAddress = async (req, res) => {
    const { userEmail } = req.params;

    try {
        const addresses = await Address.findAll({ where: { userId: userEmail } });

        if (!addresses || addresses.length === 0) {
            return res.status(404).send('Addresses not found');
        }

        res.status(200).send(addresses);
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
};