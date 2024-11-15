import express from 'express';
import chatController from '../controllers/chatController.js';
import authController from '../controllers/authController.js';

const router = express.Router();

router.post('/chats', authController.verifyToken, chatController.createChat);

router.get(
  '/chats/:chatId',
  authController.verifyToken,
  chatController.getChat,
);

router.post(
  '/chats/:chatId',
  authController.verifyToken,
  chatController.postMessage,
);

router.put(
  '/chats/:chatId',
  authController.verifyToken,
  chatController.removeFromChat,
);

router.put(
  '/chats/:chatId/members',
  authController.verifyToken,
  chatController.updateChatMembers,
);

router.delete(
  '/chats/:chatId',
  authController.verifyToken,
  chatController.deleteChat,
);

router.delete(
  '/chats/:chatId/messages/:messageId',
  authController.verifyToken,
  chatController.deleteMessage,
);
export default router;
