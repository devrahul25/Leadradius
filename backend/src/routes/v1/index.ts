import { Router } from "express";
import authRoutes from "./auth.routes";
import leadRoutes from "./leads.routes";
import exportRoutes from "./export.routes";
import adminRoutes from "./admin.routes";
import settingsRoutes from "./settings.routes";

/** v1 API router. Mount under env.API_PREFIX (defaults to /api/v1). */
const router = Router();

router.use("/auth", authRoutes);
router.use("/leads", leadRoutes);
router.use("/export", exportRoutes);
router.use("/admin", adminRoutes);
router.use("/settings", settingsRoutes);

export default router;
