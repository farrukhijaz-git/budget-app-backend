import { Request, Response } from 'express';
import Budget from '../models/Budget';

export const createBudget = async (req: Request, res: Response) => {
  const budget = new Budget({ ...req.body, userId: req.user.id });
  const saved = await budget.save();
  res.status(201).json(saved);
};

export const getBudgets = async (req: Request, res: Response) => {
  const budgets = await Budget.find({ userId: req.user.id });
  res.json(budgets);
};

export const updateBudget = async (req: Request, res: Response) => {
  const updated = await Budget.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  res.json(updated);
};

export const deleteBudget = async (req: Request, res: Response) => {
  await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.status(204).send();
};
