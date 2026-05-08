import { Router } from "express";
import { settingsController } from "../../controllers/settings.controller";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/", settingsController.getSettings);
router.post("/", settingsController.updateSettings);

export default router;
