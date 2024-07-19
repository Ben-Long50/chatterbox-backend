import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema({
  body: { type: String, required: true },
  date: { type: Date, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model('Message', MessageSchema);
