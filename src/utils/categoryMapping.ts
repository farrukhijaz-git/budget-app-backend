/**
 * Category mapping utilities for Plaid to Budget categories
 * Maps Plaid's transaction categories to our budget categories
 */

// Our budget categories
export const BUDGET_CATEGORIES = [
  "Housing",
  "Utilities", 
  "Transportation",
  "Groceries",
  "Dining Out",
  "Health",
  "Insurance",
  "Personal",
  "Entertainment",
  "Savings",
  "Other"
] as const;

export type BudgetCategory = typeof BUDGET_CATEGORIES[number];

/**
 * Maps Plaid transaction categories to our budget categories
 * Plaid categories: https://plaid.com/docs/api/products/transactions/#transaction-category-hierarchy
 */
export const PLAID_TO_BUDGET_MAPPING: Record<string, BudgetCategory> = {
  // Food and Drink
  "Food and Drink": "Dining Out",
  "Restaurants": "Dining Out", 
  "Fast Food": "Dining Out",
  "Coffee Shop": "Dining Out",
  "Bar": "Dining Out",
  "Groceries": "Groceries",
  
  // Transportation
  "Transportation": "Transportation",
  "Gas Stations": "Transportation",
  "Parking": "Transportation",
  "Public Transportation": "Transportation",
  "Taxi": "Transportation",
  "Automotive": "Transportation",
  
  // Housing & Home
  "Rent": "Housing",
  "Mortgage": "Housing", 
  "Home Improvement": "Housing",
  "Furniture": "Housing",
  "Home": "Housing",
  
  // Utilities
  "Utilities": "Utilities",
  "Electric": "Utilities",
  "Gas": "Utilities",
  "Water": "Utilities",
  "Internet": "Utilities",
  "Phone": "Utilities",
  "Cable": "Utilities",
  
  // Healthcare
  "Healthcare": "Health",
  "Medical": "Health",
  "Pharmacy": "Health",
  "Dentist": "Health",
  "Doctor": "Health",
  
  // Entertainment
  "Entertainment": "Entertainment",
  "Movies": "Entertainment",
  "Music": "Entertainment",
  "Sports": "Entertainment",
  "Recreation": "Entertainment",
  "Gaming": "Entertainment",
  
  // Shopping & Personal
  "Shops": "Personal",
  "Shopping": "Personal",
  "Clothing": "Personal",
  "Personal Care": "Personal",
  "Beauty": "Personal",
  "Electronics": "Personal",
  
  // Financial & Insurance
  "Insurance": "Insurance",
  "Life Insurance": "Insurance",
  "Auto Insurance": "Insurance",
  "Health Insurance": "Insurance",
  
  // Savings & Investment
  "Transfer": "Savings",
  "Savings": "Savings",
  "Investment": "Savings",
  "Retirement": "Savings",
  
  // Bills & Payments
  "Payment": "Other",
  "Credit Card": "Other",
  "Loan": "Other",
  "Bank Fees": "Other",
  "ATM": "Other"
};

/**
 * Maps a Plaid transaction category to our budget category
 */
export function mapPlaidCategoryToBudget(plaidCategory: string | undefined): BudgetCategory {
  if (!plaidCategory) return "Other";
  
  // Check direct mapping first
  if (PLAID_TO_BUDGET_MAPPING[plaidCategory]) {
    return PLAID_TO_BUDGET_MAPPING[plaidCategory];
  }
  
  // Check partial matches for better mapping
  const categoryLower = plaidCategory.toLowerCase();
  
  if (categoryLower.includes("food") || categoryLower.includes("restaurant") || categoryLower.includes("dining")) {
    return "Dining Out";
  }
  if (categoryLower.includes("grocery") || categoryLower.includes("supermarket")) {
    return "Groceries";
  }
  if (categoryLower.includes("gas") || categoryLower.includes("fuel") || categoryLower.includes("transport")) {
    return "Transportation";
  }
  if (categoryLower.includes("rent") || categoryLower.includes("mortgage") || categoryLower.includes("home")) {
    return "Housing";
  }
  if (categoryLower.includes("electric") || categoryLower.includes("utility") || categoryLower.includes("phone")) {
    return "Utilities";
  }
  if (categoryLower.includes("medical") || categoryLower.includes("health") || categoryLower.includes("pharmacy")) {
    return "Health";
  }
  if (categoryLower.includes("entertainment") || categoryLower.includes("movie") || categoryLower.includes("game")) {
    return "Entertainment";
  }
  if (categoryLower.includes("insurance")) {
    return "Insurance";
  }
  if (categoryLower.includes("saving") || categoryLower.includes("investment")) {
    return "Savings";
  }
  
  // Default to Other for unmapped categories
  return "Other";
}

/**
 * Gets the icon for a budget category
 */
export function getCategoryIcon(category: BudgetCategory): string {
  const iconMap: Record<BudgetCategory, string> = {
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
  
  return iconMap[category] || "📦";
}
