import express from 'express';
import cors from 'cors';
import chatController from '../controllers/chatController.js';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/chats/:chatId', cors(), chatController.getChat);

router.post(
  '/chats/:chatId',
  cors(),
  authController.verifyToken,
  chatController.postMessage,
);

export default router;
