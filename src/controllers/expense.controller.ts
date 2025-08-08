import { Request, Response } from 'express';
import Expense from '../models/Expense';
import User from '../models/User';
import { AuthUser } from '../@types/express';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

import { plaidClient } from '../config/plaid';
// Create a new expense
export const createExpense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(400).json({ message: 'User not authenticated' });
    }
    const { name, amount, date, category } = req.body;
    const expense = new Expense({
      userId: req.user.uid,
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

export const getExpenses = async (req: AuthenticatedRequest, res: Response) => {
  console.log('[getExpenses] Starting controller...');
  console.log('[getExpenses] req.user:', req.user);
  
  if (!req.user?.uid) {
    console.log('[getExpenses] No user or uid in request');
    return res.status(400).json({ message: 'User not authenticated' });
  }
  
  console.log('[getExpenses] About to query expenses for uid:', req.user.uid);
  try {
    const expenses = await Expense.find({ userId: req.user.uid }).sort({ date: -1 });
    console.log('[getExpenses] Found expenses:', expenses.length);
    res.json(expenses);
  } catch (error) {
    console.error('[getExpenses] Error:', error);
    res.status(500).json({ message: 'Failed to get expenses', error });
  }
};

export const syncExpensesFromPlaid = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.uid) {
    return res.status(400).json({ message: 'User not authenticated' });
  }
  const user = await User.findById(req.user.uid);
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
