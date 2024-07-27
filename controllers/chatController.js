import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import Chat from '../models/chat.js';
import Message from '../models/message.js';
import User from '../models/user.js';
import { io } from '../app.js';

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

          await chat.save();

          const user = await User.findByIdAndUpdate(
            req.body.author,
            { $push: { chats: chat } },
            { new: true },
          );

          io.emit('createChat', { chat, user });

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
        .populate('members')
        .exec();
      res.status(200).json({
        name: chat.name,
        messages: chat.messages,
        members: chat.members,
      });
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

          const author = await User.findById(req.body.author);

          await User.findByIdAndUpdate(
            req.body.author,
            { $push: { messages: message } },
            { new: true },
          );

          await Chat.findByIdAndUpdate(
            req.params.chatId,
            { $push: { messages: message } },
            { new: true },
          );

          io.to(req.params.chatId).emit('newMessage', {
            ...message.toObject(),
            author: {
              _id: author._id,
              username: author.username,
            },
          });

          res.status(200).json({ message });
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
      ).populate('members');

      await User.findByIdAndUpdate(
        req.body.friendId,
        { $addToSet: { chats: chat._id } },
        { new: true },
      );

      io.emit('addToChat', chat);

      res.status(200).json({ message: 'Friend added to chat' });
    } catch (error) {
      res.status(400).json({ message: 'Error adding friend to chat' });
    }
  }),

  deleteChat: asyncHandler(async (req, res) => {
    try {
      const chat = await Chat.findById(req.body.chatId);
      const messageIds = chat.messages;
      await Message.deleteMany({ _id: { $in: chat.messages } });
      await Chat.findByIdAndDelete(req.body.chatId);
      await User.updateMany(
        { chats: req.body.chatId },
        { $pull: { chats: req.body.chatId } },
      );
      await User.updateMany(
        { messages: { $in: messageIds } },
        { $pull: { messages: { $in: messageIds } } },
      );

      io.emit('deleteChat', chat);

      res.status(200).json({ message: 'Chat deleted' });
    } catch (error) {
      res.status(400).json({ message: 'Error deleting chat' });
    }
  }),

  deleteMessage: asyncHandler(async (req, res) => {
    try {
      await Message.findByIdAndDelete(req.params.messageId);
      await Chat.findByIdAndUpdate(req.params.chatId, {
        $pull: { messages: req.params.messageId },
      });
      await User.findByIdAndUpdate(req.body.userId, {
        $pull: { messages: req.params.messageId },
      });

      io.to(req.params.chatId).emit('deletedMessage', {
        messageId: req.params.messageId,
      });

      res.status(200).json({ message: 'Message deleted' });
    } catch (error) {
      res.status(400).json({ message: 'Error deleting message' });
    }
  }),
};

export default chatController;
