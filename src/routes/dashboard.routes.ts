import { Router } from "express";
import { getDashboardData } from "../controllers/dashboard.controller";
import unifiedAuth from "../middleware/unifiedAuth.middleware";

const router = Router();

// Dashboard endpoint - requires authentication
router.get("/", unifiedAuth, getDashboardData);

export default router;
