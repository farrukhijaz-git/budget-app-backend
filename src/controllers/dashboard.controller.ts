import { Request, Response } from "express";
import User from "../models/User";
import Budget from "../models/Budget";
import Expense from "../models/Expense";
import { plaidClient } from '../config/plaid';
import { mapPlaidCategoryToBudget, getCategoryIcon, BUDGET_CATEGORIES, type BudgetCategory } from '../utils/categoryMapping';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get user data for monthly income
    const user = await User.findById(userId);
    const monthlyIncome = user?.monthlyIncome || 0;

    // Get budget data
    const budgets = await Budget.find({ userId });
    const totalBudget = budgets.reduce((sum: number, budget: any) => sum + budget.amount, 0);

    // Get current month's expenses from both manual entries and Plaid transactions
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Manual expenses
    const manualExpenses = await Expense.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Initialize spending calculation
    let totalSpent = 0;
    const categorySpending: { [key: string]: number } = {};
    let plaidTransactions: any[] = [];

    // Add manual expenses to category spending
    manualExpenses.forEach((expense: any) => {
      const amount = Math.abs(expense.amount); // Ensure positive for spending
      totalSpent += amount;
      
      if (categorySpending[expense.category]) {
        categorySpending[expense.category] += amount;
      } else {
        categorySpending[expense.category] = amount;
      }
    });

    // Fetch and add Plaid transaction data if available
    try {
      if (user?.plaidAccessToken) {
        const plaidResponse = await plaidClient.transactionsGet({
          access_token: user.plaidAccessToken,
          start_date: startOfMonth.toISOString().slice(0, 10),
          end_date: endOfMonth.toISOString().slice(0, 10),
          options: { count: 500, offset: 0 }
        });

        plaidTransactions = plaidResponse.data.transactions;

        // Process Plaid transactions for spending calculation
        plaidTransactions.forEach((transaction: any) => {
          // Only count positive amounts as expenses (Plaid shows expenses as positive)
          if (transaction.amount > 0) {
            const amount = transaction.amount;
            totalSpent += amount;

            // Map Plaid category to our budget category
            const plaidCategory = transaction.category?.[0];
            const budgetCategory = mapPlaidCategoryToBudget(plaidCategory);

            if (categorySpending[budgetCategory]) {
              categorySpending[budgetCategory] += amount;
            } else {
              categorySpending[budgetCategory] = amount;
            }
          }
        });
      }
    } catch (plaidError) {
      console.warn('Could not fetch Plaid transactions for dashboard:', plaidError);
      // Continue without Plaid data - manual expenses still work
    }

    // Create budget categories with real spending data
    const budgetCategories = BUDGET_CATEGORIES.map((categoryName) => {
      const budget = budgets.find((b: any) => b.category === categoryName);
      return {
        name: categoryName,
        icon: getCategoryIcon(categoryName as BudgetCategory),
        budgeted: budget?.amount || 0,
        spent: categorySpending[categoryName] || 0
      };
    });

    // Get recent transactions from both manual and Plaid sources
    const recentTransactions = [
      // Manual expenses
      ...manualExpenses
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4)
        .map((expense: any) => ({
          id: expense._id,
          name: expense.name,
          amount: -Math.abs(expense.amount), // Negative for expenses
          date: expense.date.toISOString().split('T')[0],
          category: expense.category
        })),
      
      // Plaid transactions (recent expenses only)
      ...plaidTransactions
        .filter((txn: any) => txn.amount > 0) // Only expenses
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4)
        .map((txn: any) => ({
          id: txn.transaction_id,
          name: txn.name,
          amount: -txn.amount, // Negative for expenses
          date: txn.date,
          category: mapPlaidCategoryToBudget(txn.category?.[0])
        }))
    ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8); // Show 8 most recent transactions

    // Get real account balances from Plaid if available
    let accountBalances: Array<{name: string, balance: number, type: string}> = [];
    try {
      if (user?.plaidAccessToken) {
        const accountsResponse = await plaidClient.accountsGet({
          access_token: user.plaidAccessToken
        });
        
        accountBalances = accountsResponse.data.accounts.map((account: any) => ({
          name: account.name,
          balance: account.balances.current || 0,
          type: account.subtype || account.type || 'checking'
        }));
      }
    } catch (accountError) {
      console.warn('Could not fetch Plaid accounts for dashboard:', accountError);
      // Use mock data if Plaid fails
      accountBalances = [
        { name: "Main Checking", balance: 2500, type: "checking" },
        { name: "Savings Account", balance: 8000, type: "savings" }
      ];
    }

    // Return dashboard data
    res.json({
      monthlyIncome,
      totalBudget,
      totalSpent,
      accountBalances,
      budgetCategories,
      recentTransactions
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};
