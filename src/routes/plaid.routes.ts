import express from 'express';
// Make sure the file exists at the specified path, or update the path if necessary.
import { createLinkToken, setAccessToken, syncTransactions } from '../controllers/plaid.controller';

const router = express.Router();

router.post('/create_link_token', createLinkToken);
router.post('/set_access_token', setAccessToken);
router.post('/sync_transactions', syncTransactions);

export default router;
