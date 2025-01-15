import express from 'express';
import { addAddress, getAllAddress } from '../controllers/addressController.js';

const router = express.Router();

router.post('/addAddress', addAddress);
router.get('/getAddresses/:userEmail', getAllAddress);

export default router;