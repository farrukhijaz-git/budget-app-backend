import express from 'express';
import {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  saveBudgets,
} from '../controllers/budget.controller';

const router = express.Router();

router.post('/bulk', saveBudgets); // New bulk save endpoint
router.post('/', createBudget);
router.get('/', getBudgets);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
