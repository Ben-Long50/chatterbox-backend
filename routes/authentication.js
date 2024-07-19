import express from 'express';
import cors from 'cors';
import authController from '../controllers/authController.js';
import userController from '../controllers/userController.js';

const router = express.Router();

router.post('/users/signup', cors(), userController.createUser);

router.post('/users/signin', cors(), authController.userSignin);

export default router;
