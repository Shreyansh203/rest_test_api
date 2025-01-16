import express from 'express';
import { signUp, login, changePassword, getProfile, updateProfile } from '../controllers/userController.js';

const router = express.Router();

router.post('/signUp', signUp);
router.post('/login', login);
router.put('/changePassword', changePassword);
router.get('/profile/:userEmail', getProfile);
router.put('/profile/:userEmail', updateProfile);

export default router;
