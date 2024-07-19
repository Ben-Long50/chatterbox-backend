import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import Chat from '../models/chat.js';
import Message from '../models/message.js';

const chatController = {
  getChat: asyncHandler(async (req, res) => {
    try {
      const chatMessags = await Chat.findById(req.params.chatId)
        .populate({
          path: 'messages',
          populate: {
            path: 'author',
            model: 'User',
          },
        })
        .exec();
      res.status(200).json(chatMessags.messages);
    } catch (error) {
      res.status(500).json({ message: 'Error getting global chat messages' });
    }
  }),

  postMessage: [
    body('message', 'Message must not be empty').trim().isLength({ min: 1 }),

    asyncHandler(async (req, res) => {
      const errors = validationResult(req);
      console.log(errors);
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

          res.status(200).json({ message });
        } catch (error) {
          res.status(500).json({ message: 'Error submitting message' });
        }
      }
    }),
  ],
};

export default chatController;
