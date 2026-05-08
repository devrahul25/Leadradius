import { Router } from "express";
import { leadController } from "../../controllers/lead.controller";
import { requireAuth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { searchLimiter } from "../../middlewares/rate-limit";
import { idParamSchema, listLeadsSchema, searchSchema } from "../../validators/lead.validator";

const router = Router();

router.use(requireAuth);

router.post("/search", searchLimiter, validate(searchSchema), leadController.search);
router.get("/", validate(listLeadsSchema), leadController.list);
router.get("/:id", validate(idParamSchema), leadController.getById);
router.delete("/:id", validate(idParamSchema), leadController.remove);

export default router;
