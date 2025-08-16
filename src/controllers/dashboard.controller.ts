import { Request, Response } from "express";
import User from "../models/User";
import Budget from "../models/Budget";
import Expense from "../models/Expense";

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

    // Get current month's expenses (manual only for now)
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Manual expenses
    const manualExpenses = await Expense.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Calculate total spent from manual expenses (we'll add Plaid data later)
    const totalSpent = manualExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);

    // Calculate spending by category
    const categorySpending: { [key: string]: number } = {};
    
    // Add manual expenses to category spending
    manualExpenses.forEach((expense: any) => {
      if (categorySpending[expense.category]) {
        categorySpending[expense.category] += expense.amount;
      } else {
        categorySpending[expense.category] = expense.amount;
      }
    });

    // Create budget categories with spending data
    // Always show all available categories, even if no budget is set
    const allCategories = [
      "Housing", "Utilities", "Transportation", "Groceries", 
      "Dining Out", "Health", "Insurance", "Personal", 
      "Entertainment", "Savings", "Other"
    ];
    
    const budgetCategories = allCategories.map((categoryName) => {
      const budget = budgets.find((b: any) => b.category === categoryName);
      return {
        name: categoryName,
        icon: getCategoryIcon(categoryName),
        budgeted: budget?.amount || 0,
        spent: categorySpending[categoryName] || 0
      };
    });

    // Get recent transactions (manual expenses for now)
    const recentTransactions = manualExpenses
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
      .map((expense: any) => ({
        id: expense._id,
        name: expense.name,
        amount: -expense.amount, // Negative for expenses
        date: expense.date.toISOString().split('T')[0],
        category: expense.category
      }));

    // Mock account balances for now (will be replaced with real Plaid account data)
    const accountBalances = [
      { name: "Checking", balance: 2400, type: "checking" },
      { name: "Savings", balance: 15600, type: "savings" },
      { name: "Credit Card", balance: -850, type: "credit" }
    ];

    const dashboardData = {
      monthlyIncome,
      totalBudget,
      totalSpent,
      accountBalances,
      budgetCategories,
      recentTransactions
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

// Helper function to get category icons
const getCategoryIcon = (category: string): string => {
  const icons: { [key: string]: string } = {
    "Income": "💰",
    "Housing": "🏠",
    "Utilities": "💡",
    "Transportation": "🚗",
    "Groceries": "🛒",
    "Dining Out": "🍽️",
    "Health": "🏥",
    "Insurance": "🛡️",
    "Personal": "🧑",
    "Entertainment": "🎬",
    "Savings": "🏦",
    "Other": "📦"
  };
  
  return icons[category] || "📦";
};
