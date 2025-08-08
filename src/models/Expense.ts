import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  name: String,
  amount: Number,
  date: Date,
  category: String,
  plaidTransactionId: String,
});

export default mongoose.model('Expense', ExpenseSchema);
