import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import User from '../models/user.js';
import Message from '../models/message.js';
import Chat from '../models/chat.js';

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
          chats: ['66999af0d7e2908c706b637d'],
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
        await User.findByIdAndUpdate(
          req.body.newFriendId,
          { $addToSet: { friends: req.params.userId } },
          { new: true },
        );

        await User.findByIdAndUpdate(
          req.params.userId,
          { $addToSet: { friends: req.body.newFriendId } },
          { new: true },
        );
      } else {
        res
          .status(400)
          .json({ message: 'You cannot add yourself as a friend' });
      }
      res.status(200).json({ message: 'Added friend' });
    } catch (error) {
      res.status(400).json({ message: 'Error adding friend' });
    }
  }),

  removeFriend: asyncHandler(async (req, res) => {
    try {
      await User.findByIdAndUpdate(
        req.body.friendId,
        { $pull: { friends: req.params.userId } },
        { new: true },
      );

      await User.findByIdAndUpdate(
        req.params.userId,
        { $pull: { friends: req.body.friendId } },
        { new: true },
      );
      res.status(200).json({ message: 'Removed friend' });
    } catch (error) {
      res.status(400).json({ message: 'Error removing friend' });
    }
  }),

  getBestFriends: asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
        .populate('friends chats')
        .exec();
      const friendIds = user.friends.map((friend) => friend._id.toString());
      const userChatRoomIds = user.chats.slice(1).map((room) => room._id);

      const sharedChatRooms = await Chat.find({
        _id: { $in: userChatRoomIds },
        $and: [{ members: req.params.userId }, { members: { $in: friendIds } }],
      })
        .populate({
          path: 'messages',
          populate: {
            path: 'author',
            model: 'User',
          },
        })
        .exec();
      // Extract all messages from the shared chat rooms
      const allMessages = sharedChatRooms.reduce(
        (acc, room) => acc.concat(room.messages),
        [],
      );

      // Aggregate messages to count the number sent by each friend
      const messageCounts = {};
      allMessages.forEach((message) => {
        const authorId = message.author._id.toString();
        if (friendIds.includes(authorId)) {
          if (!messageCounts[authorId]) {
            messageCounts[authorId] = 0;
          }
          messageCounts[authorId]++;
        }
      });

      const bestFriendsWithMessageCount = Object.entries(messageCounts)
        .map(([id, count]) => ({ friendId: id, totalMessages: count }))
        .sort((a, b) => b.totalMessages - a.totalMessages);

      const bestFriends = await User.find({
        _id: { $in: bestFriendsWithMessageCount.map((f) => f.friendId) },
      })
        .populate('friends')
        .exec();

      const result = bestFriends.map((friend) => {
        const messageData = bestFriendsWithMessageCount.find(
          (f) => f.friendId === friend._id.toString(),
        );
        return {
          friend,
          totalMessages: messageData ? messageData.totalMessages : 0,
        };
      });

      res.status(200).json(result);
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
    await User.findByIdAndDelete(req.params.userId);
  }),
};

export default userController;
