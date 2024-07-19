import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  image: { type: String },
  chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export default mongoose.model('User', UserSchema);
