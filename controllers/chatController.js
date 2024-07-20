import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import Chat from '../models/chat.js';
import Message from '../models/message.js';
import User from '../models/user.js';

const chatController = {
  createChat: [
    body('name', 'Name must not be empty').trim().isLength({ min: 1 }),

    asyncHandler(async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(errors.array());
      } else {
        try {
          const chat = new Chat({
            name: req.body.name,
            members: [req.body.author],
          });

          chat.save();

          await User.findByIdAndUpdate(
            req.body.author,
            { $push: { chats: chat } },
            { new: true },
          );

          res.status(200).json({ message: 'Chat created' });
        } catch (error) {
          res.status(400).json({ message: 'Error creating chat' });
        }
      }
    }),
  ],

  getChat: asyncHandler(async (req, res) => {
    try {
      const chat = await Chat.findById(req.params.chatId)
        .populate({
          path: 'messages',
          populate: {
            path: 'author',
            model: 'User',
          },
        })
        .exec();
      res.status(200).json({ name: chat.name, messages: chat.messages });
    } catch (error) {
      res.status(400).json({ message: 'Error getting global chat messages' });
    }
  }),

  postMessage: [
    body('message', 'Message must not be empty').trim().isLength({ min: 1 }),

    asyncHandler(async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(errors.array());
      } else {
        try {
          const message = new Message({
            body: req.body.message,
            author: req.body.author,
            date: req.body.date,
          });

          message.save();

          await Chat.findByIdAndUpdate(
            req.params.chatId,
            { $push: { messages: message } },
            { new: true },
          );

          res.status(200).json({ message: 'Message submitted' });
        } catch (error) {
          res.status(400).json({ message: 'Error submitting message' });
        }
      }
    }),
  ],

  updateChatMembers: asyncHandler(async (req, res) => {
    try {
      const chat = await Chat.findByIdAndUpdate(
        req.params.chatId,
        { $addToSet: { members: req.body.friendId } },
        { new: true },
      );
      await User.findByIdAndUpdate(
        req.body.friendId,
        { $addToSet: { chats: chat._id } },
        { new: true },
      );

      res.status(200).json({ message: 'Friend added to chat' });
    } catch (error) {
      res.status(400).json({ message: 'Error adding friend to chat' });
    }
  }),

  deleteChat: asyncHandler(async (req, res) => {
    try {
      const chat = await Chat.findById(req.body.chatId);
      await Message.deleteMany({ _id: { $in: chat.messages } });
      await Chat.findByIdAndDelete(req.body.chatId);
      await User.updateMany(
        { chats: req.body.chatId },
        { $pull: { chats: req.body.chatId } },
      );
      res.status(200).json({ message: 'Chat deleted' });
    } catch (error) {
      res.status(400).json({ message: 'Error deleting chat' });
    }
  }),
};

export default chatController;
