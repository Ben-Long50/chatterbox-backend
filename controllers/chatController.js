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

  getGlobalChat: async (req, res) => {
    try {
      const chat = await Chat.findOne({ name: 'Global' });
      res.status(200).json(chat);
    } catch (error) {
      res.status(400).json({ message: 'Error getting global chat messages' });
    }
  },

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
      const chat = await Chat.findById(req.params.chatId);

      if (chat.name !== 'Global') {
        const updatedChat = await Chat.findByIdAndUpdate(
          req.params.chatId,
          { $addToSet: { members: req.body.friendId } },
          { new: true },
        ).populate('members');

        const user = await User.findByIdAndUpdate(
          req.body.friendId,
          { $addToSet: { chats: chat._id } },
          { new: true },
        );

        io.emit('addToChat', { updatedChat, user });

        res.status(200).json({ message: 'Friend added to chat' });
      } else {
        throw new Error('Cannot add friends to the Global chat');
      }
    } catch (error) {
      res
        .status(400)
        .json({ message: error.message || 'Error adding friend to chat' });
    }
  }),

  removeFromChat: asyncHandler(async (req, res) => {
    try {
      console.log(req.body.memberId);

      const chat = await Chat.findByIdAndUpdate(
        req.body.chatId,
        { $pull: { members: req.body.memberId } },
        { new: true },
      );

      const user = await User.findByIdAndUpdate(
        req.body.memberId,
        { $pull: { chats: req.body.chatId } },
        { new: true },
      );

      const emptyChats = await Chat.find({ members: { $size: 0 } });

      await Promise.all(emptyChats.map((item) => deleteChatById(item._id)));

      io.emit('removeFromChat', { chat, user });

      res.status(200).json({ message: 'Member removed from chat' });
    } catch (error) {
      res.status(400).json({ message: 'Error adding friend to chat' });
    }
  }),

  deleteChat: asyncHandler(async (req, res) => {
    try {
      if (req.body.chatId === process.env.GLOBAL_CHAT_ID) {
        throw new Error('Cannot delete global chat');
      }
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

const deleteChatById = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    await Chat.findByIdAndDelete(chatId);
  } catch (error) {
    throw error;
  }
};

export default chatController;
