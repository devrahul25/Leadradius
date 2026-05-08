import { Router } from "express";
import { adminController } from "../../controllers/admin.controller";
import { requireAuth, requireRole } from "../../middlewares/auth";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", adminController.users);
router.get("/search-logs", adminController.searchLogs);
router.get("/queues", adminController.queues);
router.get("/system-stats", adminController.systemStats);

export default router;
