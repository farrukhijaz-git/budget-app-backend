import express from "express";
import { getTransactions, getAccounts } from "../controllers/plaid.transactions.controller";

const router = express.Router();

router.get("/transactions", getTransactions);
router.get("/accounts", getAccounts);

export default router;
