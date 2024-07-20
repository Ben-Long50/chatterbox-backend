import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import User from '../models/user.js';

const userController = {
  getUsers: asyncHandler(async (req, res) => {
    const users = await User.find().sort('username');
    res.json(users);
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
        .exec();
      res.status(200).json(userChats.chats);
    } catch (error) {
      res.status(400).json({ message: 'Error getting user chats' });
    }
  }),

  getFriends: asyncHandler(async (req, res) => {
    try {
      const userFriends = await User.findById(req.params.userId)
        .populate('friends')
        .exec();
      res.status(200).json(userFriends.friends);
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

  deleteUser: asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.params.userId);
  }),
};

export default userController;
