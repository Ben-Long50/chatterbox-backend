import express from 'express';
import cors from 'cors';
import chatController from '../controllers/chatController.js';
import authController from '../controllers/authController.js';

const router = express.Router();

router.post(
  '/chats',
  cors(),
  authController.verifyToken,
  chatController.createChat,
);

router.get(
  '/chats/:chatId',
  cors(),
  authController.verifyToken,
  chatController.getChat,
);

router.post(
  '/chats/:chatId',
  cors(),
  authController.verifyToken,
  chatController.postMessage,
);

export default router;
