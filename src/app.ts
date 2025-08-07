import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import budgetRoutes from './routes/budget.routes';
import expenseRoutes from './routes/expense.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Basic root route
app.get('/', (_req, res) => {
  res.send('API is running...');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/expenses', expenseRoutes);

export default app;
