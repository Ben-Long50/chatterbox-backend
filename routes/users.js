import express from 'express';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/users', authController.verifyToken, userController.getUsers);

router.get(
  '/users/:userId',
  authController.verifyToken,
  userController.getUser,
);

router.put(
  '/users/:userId',
  authController.verifyToken,
  userController.updateUser,
);

router.delete(
  '/users/:userId',
  authController.verifyToken,
  userController.deleteUser,
);

router.get(
  '/users/:userId/chats',
  authController.verifyToken,
  userController.getChats,
);

router.get(
  '/users/:userId/friends',
  authController.verifyToken,
  userController.getFriends,
);

router.get(
  '/users/:userId/friends/best',
  authController.verifyToken,
  userController.getBestFriends,
);

router.put(
  '/users/:userId/friends',
  authController.verifyToken,
  userController.addFriend,
);

router.delete(
  '/users/:userId/friends',
  authController.verifyToken,
  userController.removeFriend,
);

export default router;
