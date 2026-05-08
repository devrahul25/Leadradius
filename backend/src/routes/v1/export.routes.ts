import { Router } from "express";
import { exportController } from "../../controllers/export.controller";
import { requireAuth } from "../../middlewares/auth";
import { exportLimiter } from "../../middlewares/rate-limit";

const router = Router();

router.use(requireAuth);

router.get("/", exportController.list);
router.get("/csv", exportLimiter, exportController.csv);
router.get("/excel", exportLimiter, exportController.excel);
router.get("/status/:id", exportController.status);
router.get("/download/:id", exportController.download);

export default router;
