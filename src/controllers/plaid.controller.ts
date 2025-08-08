import { Request, Response } from 'express';
import { plaidClient } from '../config/plaid';
import { Products, CountryCode } from 'plaid';
import User from '../models/User';
import { AuthUser } from '../@types/express';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const createLinkToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: req.user.uid },
      client_name: 'Budget App',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });
    res.json({ link_token: response.data.link_token });
  } catch (error: any) {
    console.error('[Plaid] Error in createLinkToken:', error?.response?.data || error);
    res.status(500).json({ message: 'Failed to create link token', error: error?.response?.data || error });
  }
};

export const setAccessToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { public_token } = req.body;
    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = response.data.access_token;
    await User.findByIdAndUpdate(req.user.uid, { plaidAccessToken: accessToken });
    res.json({ message: 'Plaid access token set' });
  } catch (error: any) {
    console.error('[Plaid] Error in setAccessToken:', error?.response?.data || error);
    res.status(500).json({ message: 'Failed to set access token', error: error?.response?.data || error });
  }
};

export const syncTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await User.findById(req.user.uid);
    if (!user?.plaidAccessToken) return res.status(400).json({ message: 'No linked Plaid account' });
    const response = await plaidClient.transactionsGet({
      access_token: user.plaidAccessToken,
      start_date: '2024-01-01',
      end_date: new Date().toISOString().split('T')[0],
    });
    // Save transactions to DB (reuse existing logic or add here)
    res.json({ transactions: response.data.transactions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to sync transactions', error });
  }
};
