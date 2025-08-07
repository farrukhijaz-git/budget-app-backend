import express from 'express';
import {
  getExpenses,
  syncExpensesFromPlaid,
} from '../controllers/expense.controller';
import auth from '../middleware/auth.middleware';

const router = express.Router();

router.use(auth);


router.get('/', getExpenses);
router.post('/', require('../controllers/expense.controller').createExpense);
router.post('/sync', syncExpensesFromPlaid); // pulls fresh data from Plaid

export default router;
