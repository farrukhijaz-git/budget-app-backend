import { Request, Response } from "express";
import User from "../models/User";
import plaidClient from "../plaid";
import { AuthUser } from "../@types/express";

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Fetch transactions for the logged-in user
export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('[getTransactions] Starting...');
    console.log('[getTransactions] req.user:', req.user);
    
    if (!req.user) {
      console.log('[getTransactions] No user in request');
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user.uid;
    console.log('[getTransactions] Looking for user with ID:', userId);
    
    const user = await User.findById(userId);
    console.log('[getTransactions] User found:', !!user);
    console.log('[getTransactions] User has plaidAccessToken:', !!user?.plaidAccessToken);
    
    if (!user || !user.plaidAccessToken) {
      console.log('[getTransactions] User has no Plaid access token');
      return res.status(400).json({ 
        message: "No Plaid access token found for user. Please connect your bank account first.",
        needsPlaidConnection: true
      });
    }
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const response = await plaidClient.transactionsGet({
      access_token: user.plaidAccessToken,
      start_date: start.toISOString().slice(0, 10),
      end_date: now.toISOString().slice(0, 10),
      options: { count: 100, offset: 0 },
    });
    res.json(response.data);
  } catch (err: any) {
    console.error("[Plaid] Error fetching transactions:", err.response || err);
    res.status(500).json({ message: "Failed to fetch transactions.", error: err.message });
  }
};

// Fetch linked accounts for the logged-in user
export const getAccounts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.uid;
    const user = await User.findById(userId);
    if (!user || !user.plaidAccessToken) {
      return res.status(400).json({ message: "No Bank account linked yet." });
    }
    const response = await plaidClient.accountsGet({
      access_token: user.plaidAccessToken,
    });
    res.json(response.data);
  } catch (err: any) {
    console.error("[Plaid] Error fetching accounts:", err.response || err);
    res.status(500).json({ message: "Failed to fetch accounts.", error: err.message });
  }
};
