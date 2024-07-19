import mongoose, { Schema } from 'mongoose';

const ChatSchema = new Schema({
  name: { type: String },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export default mongoose.model('Chat', ChatSchema);
