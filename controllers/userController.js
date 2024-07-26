import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import User from '../models/user.js';
import Message from '../models/message.js';
import Chat from '../models/chat.js';
import { io } from '../app.js';

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

const userController = {
  getUser: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
        .populate('friends')
        .exec();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error getting user' });
    }
  }),

  getUsers: asyncHandler(async (req, res) => {
    try {
      const currentUser = await User.findById(req.query.userId)
        .populate('friends')
        .exec();
      const friendIds = currentUser.friends.map((friend) => friend._id);
      const users = await User.find({
        _id: { $nin: [req.query.userId, ...friendIds] },
      })
        .populate('friends')
        .sort('username');
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error getting users' });
    }
  }),

  createUser: [
    body('username', 'Username must be a minimum of 3 characters')
      .trim()
      .isLength({ min: 3 })
      .escape()
      .custom(async (value) => {
        const user = await User.findOne({ username: value });
        if (user) {
          throw new Error('Username already exists');
        }
        return true;
      }),

    body('password', 'Password must be a minimum of 3 characters')
      .trim()
      .isLength({ min: 3 })
      .escape(),

    body('confirmPassword', 'Passwords must match')
      .trim()
      .escape()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          return false;
        }
        return true;
      }),

    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json(errors.array());
      } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
          username: req.body.username,
          password: hashedPassword,
          chats: ['66a305269cda21178b7bf604'],
        });
        await user.save();
        res.status(200).json({ message: 'Sign up successful' });
      }
    }),
  ],

  getChats: asyncHandler(async (req, res) => {
    try {
      const userChats = await User.findById(req.params.userId)
        .populate('chats')
        .populate({
          path: 'chats',
          populate: {
            path: 'members',
            model: 'User',
          },
        })
        .exec();
      res.status(200).json(userChats.chats);
    } catch (error) {
      res.status(400).json({ message: 'Error getting user chats' });
    }
  }),

  getFriends: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
        .populate({
          path: 'friends',
          populate: {
            path: 'friends',
            model: 'User',
          },
        })
        .exec();
      res.status(200).json(user.friends);
    } catch (error) {
      res.status(400).json({ message: 'Error getting friends' });
    }
  }),

  addFriend: asyncHandler(async (req, res) => {
    try {
      if (req.body.newFriendId !== req.params.userId) {
        const newFriend = await User.findByIdAndUpdate(
          req.body.newFriendId,
          { $addToSet: { friends: req.params.userId } },
          { new: true },
        );

        await User.findByIdAndUpdate(
          req.params.userId,
          { $addToSet: { friends: req.body.newFriendId } },
          { new: true },
        );
        io.emit('removeMember', newFriend);
        io.emit('addFriend', newFriend);
        console.log(newFriend);
        res.status(200).json({ message: 'Added friend' });
      } else {
        res
          .status(400)
          .json({ message: 'You cannot add yourself as a friend' });
      }
    } catch (error) {
      res.status(400).json({ message: 'Error adding friend' });
    }
  }),

  removeFriend: asyncHandler(async (req, res) => {
    try {
      const oldFriend = await User.findByIdAndUpdate(
        req.body.friendId,
        { $pull: { friends: req.params.userId } },
        { new: true },
      );

      await User.findByIdAndUpdate(
        req.params.userId,
        { $pull: { friends: req.body.friendId } },
        { new: true },
      );

      io.emit('addMember', oldFriend);
      io.emit('removeFriend', oldFriend);

      res.status(200).json({ message: 'Removed friend' });
    } catch (error) {
      res.status(400).json({ message: 'Error removing friend' });
    }
  }),

  getBestFriends: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
        .populate('chats')
        .populate({
          path: 'friends',
          populate: {
            path: 'chats',
            model: 'Chat',
            populate: {
              path: 'messages',
              model: 'Message',
            },
          },
        })
        .exec();
      const userChatIds = user.chats.map((chat) => chat._id.toString());

      const sharedData = user.friends.map((friend) => {
        const sharedChats = friend.chats.filter((chat) => {
          if (
            userChatIds.includes(chat._id.toString()) &&
            chat.name !== 'Global'
          ) {
            return chat;
          }
        });

        const messagesInChats = sharedChats.reduce(
          (acc, chat) => acc.concat(chat.messages),
          [],
        );
        console.log(messagesInChats);
        const messageCount = messagesInChats.filter((message) => {
          if (
            message.author.toString() === req.params.userId.toString() ||
            message.author.toString() === friend._id.toString()
          ) {
            return message;
          }
        });
        return {
          friendName: friend.username,
          friendId: friend._id,
          count: messageCount.length,
        };
      });

      const sortedData = sharedData.sort((a, b) => b.count - a.count);

      res.status(200).json(sortedData);
    } catch (error) {
      res.status(400).json({ message: 'Failed to get best friends' });
    }
  }),

  updateUser: asyncHandler(async (req, res) => {
    try {
      await User.findByIdAndUpdate(
        req.params.userId,
        { username: req.body.username, profile: { bio: req.body.bio } },
        { new: true },
      );
      res.status(200).json({ message: 'Profile updated' });
    } catch (error) {
      res.status(400).json(error);
    }
  }),

  deleteUser: asyncHandler(async (req, res) => {
    console.log(1);
    try {
      const user = await User.findById(req.params.userId).select('messages');
      const messageIds = user.messages;

      await Message.deleteMany({ _id: { $in: messageIds } });

      await User.findByIdAndDelete(req.params.userId);

      await User.updateMany({}, { $pull: { friends: req.params.userId } });

      await Chat.updateMany({}, { $pull: { members: req.params.userId } });

      await Chat.updateMany({}, { $pull: { messages: { $in: messageIds } } });

      const emptyChats = await Chat.find({ members: { $size: 0 } });

      await Promise.all(emptyChats.map((chat) => deleteChatById(chat._id)));

      res.status(200).json({ message: 'User deleted' });
    } catch (error) {
      res.status(400).json(error);
    }
  }),
};

export default userController;
