import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  amount: Number,
  date: Date,
  category: String,
  plaidTransactionId: String,
});

export default mongoose.model('Expense', ExpenseSchema);
