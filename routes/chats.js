import express from 'express';
import chatController from '../controllers/chatController.js';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get(
  '/chats/global',
  authController.verifyToken,
  chatController.getGlobalChat,
);

router.get(
  '/chats/:chatId',
  authController.verifyToken,
  chatController.getChat,
);

router.post('/chats', authController.verifyToken, chatController.createChat);

router.post(
  '/chats/:chatId/messages',
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
