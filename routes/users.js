import express from 'express';
import cors from 'cors';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get(
  '/users',
  cors(),
  authController.verifyToken,
  userController.getUsers,
);

router.get(
  '/users/:userId',
  cors(),
  authController.verifyToken,
  userController.getUser,
);

router.put(
  '/users/:userId',
  cors(),
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

router.get(
  '/users/:userId/friends/best',
  cors(),
  authController.verifyToken,
  userController.getBestFriends,
);

router.put(
  '/users/:userId/friends',
  cors(),
  authController.verifyToken,
  userController.addFriend,
);

router.delete(
  '/users/:userId/friends',
  cors(),
  authController.verifyToken,
  userController.removeFriend,
);

export default router;
