import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const authController = {
  userSignin: [
    body('username', 'Username does not exist')
      .trim()
      .escape()
      .custom(async (value) => {
        const user = await User.findOne({ username: value });
        if (!user) {
          throw new Error('Username does not exist');
        }
        return true;
      }),
    body('password', 'Incorrect password')
      .trim()
      .escape()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
          return false;
        }
        const match = await bcrypt.compare(value, user.password);
        if (!match) {
          throw new Error('Incorrect password');
        }

        return true;
      }),

    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json(errors.array());
      } else {
        const user = await User.findOne({ username: req.body.username });
        jwt.sign(
          { user },
          process.env.SESSION_KEY || 'cats',
          { expiresIn: '1h' },
          (err, token) => {
            if (err) {
              res.status(500).json({ message: 'Error generating token' });
            }
            res.json({
              token,
            });
          },
        );
      }
    }),
  ],

  verifyToken: (req, res, next) => {
    const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader !== 'undefined') {
      const bearerToken = bearerHeader.split(' ')[1];
      req.token = bearerToken;
      jwt.verify(req.token, process.env.SESSION_KEY || 'cats', (err) => {
        if (err) {
          res.sendStatus(403);
        } else {
          next();
        }
      });
    } else {
      res.sendStatus(403);
    }
  },
};

export default authController;
