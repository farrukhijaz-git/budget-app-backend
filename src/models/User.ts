
import mongoose, { Document } from 'mongoose';

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Firebase UID as primary key
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  plaidAccessToken: { type: String },
  monthlyIncome: { type: Number, default: 0 },
}, { _id: false }); // Prevents Mongoose from auto-adding ObjectId _id

export interface UserDocument extends Document {
  _id: string;
  uid?: string; // for compatibility with auth middleware
  name?: string;
  email: string;
  password?: string;
  plaidAccessToken?: string;
  monthlyIncome?: number;
}

const User = mongoose.model<UserDocument>('User', UserSchema);
export default User;
