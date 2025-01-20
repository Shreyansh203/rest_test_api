import express from 'express';
import { signUp, login, changePassword, getProfile, updateProfile, linkRestid } from '../controllers/userController.js';

const router = express.Router();

router.post('/signUp', signUp);
router.post('/login', login);
router.put('/changePassword', changePassword);
router.get('/profile/:userEmail', getProfile);
router.put('/profile/:userEmail', updateProfile);
router.put('/restaurant-manager/:userEmail/link-restaurant', linkRestid);

export default router;
