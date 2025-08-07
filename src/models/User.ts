import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plaidAccessToken: { type: String },
});

export default mongoose.model('User', UserSchema);
