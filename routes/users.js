import express from 'express';
import cors from 'cors';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/users', cors(), userController.listUsers);

router.get(
  '/users/:userId/chats',
  cors(),
  authController.verifyToken,
  userController.getChats,
);

router.get(
  '/users/:userId/friends',
  cors(),
  authController.verifyToken,
  userController.getFriends,
);

export default router;
