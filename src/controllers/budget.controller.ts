import { Request, Response } from 'express';
import Budget from '../models/Budget';
import { AuthUser } from '../@types/express';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const createBudget = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.uid) {
    return res.status(400).json({ message: 'User not authenticated' });
  }
  const budget = new Budget({ ...req.body, userId: req.user.uid });
  const saved = await budget.save();
  res.status(201).json(saved);
};

export const getBudgets = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.uid) {
    return res.status(400).json({ message: 'User not authenticated' });
  }
  const budgets = await Budget.find({ userId: req.user.uid });
  res.json({ budgets }); // Frontend expects { budgets: [...] } format
};

export const updateBudget = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.uid) {
    return res.status(400).json({ message: 'User not authenticated' });
  }
  const updated = await Budget.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.uid },
    req.body,
    { new: true }
  );
  res.json(updated);
};

export const deleteBudget = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.uid) {
    return res.status(400).json({ message: 'User not authenticated' });
  }
  await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
  res.status(204).send();
};
