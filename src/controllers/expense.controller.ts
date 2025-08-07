import { Request, Response } from 'express';
import Expense from '../models/Expense';
import User from '../models/User';

import { plaidClient } from '../config/plaid';
// Create a new expense
export const createExpense = async (req: Request, res: Response) => {
  try {
    const { name, amount, date, category } = req.body;
    const expense = new Expense({
      userId: req.user.id,
      name,
      amount,
      date,
      category,
    });
    const saved = await expense.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create expense', error });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
  res.json(expenses);
};

export const syncExpensesFromPlaid = async (req: Request, res: Response) => {
  const user = await User.findById(req.user.id);
  if (!user?.plaidAccessToken) return res.status(400).json({ message: 'No linked Plaid account' });

  try {
    const response = await plaidClient.transactionsGet({
      access_token: user.plaidAccessToken,
      start_date: '2024-01-01',
      end_date: new Date().toISOString().split('T')[0],
    });

    const transactions = response.data.transactions;

    for (const tx of transactions) {
      await Expense.findOneAndUpdate(
        { plaidTransactionId: tx.transaction_id },
        {
          userId: user._id,
          name: tx.name,
          amount: tx.amount,
          date: tx.date,
          category: tx.category?.[0] || 'Uncategorized',
          plaidTransactionId: tx.transaction_id,
        },
        { upsert: true }
      );
    }

    res.json({ message: 'Transactions synced', count: transactions.length });
  } catch (error) {
    res.status(500).json({ message: 'Plaid sync failed', error });
  }
};
