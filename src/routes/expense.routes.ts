import express from 'express';
import {
  getExpenses,
  syncExpensesFromPlaid,
} from '../controllers/expense.controller';

const router = express.Router();

router.get('/', getExpenses);
router.post('/', require('../controllers/expense.controller').createExpense);
router.post('/sync', syncExpensesFromPlaid); // pulls fresh data from Plaid

export default router;
