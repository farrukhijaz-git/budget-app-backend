
import dotenv from 'dotenv';
dotenv.config();

import './config/firebaseAdmin'; // Ensure Firebase Admin SDK is initialized first
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import budgetRoutes from './routes/budget.routes';
import expenseRoutes from './routes/expense.routes';
import plaidRoutes from './routes/plaid.routes';
import plaidTransactionsRoutes from './routes/plaid.transactions.routes';
import userRoutes from './routes/user.routes';
import testRoutes from './routes/test.routes';
import unifiedAuth from './middleware/unifiedAuth.middleware';
import { ensureUserInDb } from './middleware/ensureUserInDb';

const app = express();

app.use(cors());
app.use(express.json());

// Basic root route
app.get('/', (_req, res) => {
  res.send('API is running...');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/budget', unifiedAuth, ensureUserInDb, budgetRoutes);
app.use('/api/user', unifiedAuth, ensureUserInDb, userRoutes);
app.use('/api/expenses', unifiedAuth, ensureUserInDb, expenseRoutes);
app.use('/api/plaid', unifiedAuth, ensureUserInDb, plaidRoutes);
app.use('/api/plaid', unifiedAuth, ensureUserInDb, plaidTransactionsRoutes);

export default app;
