import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: String },
  amount: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date },
});

export default mongoose.model('Budget', BudgetSchema);
