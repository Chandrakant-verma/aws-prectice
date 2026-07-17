import { Router } from "express";
import { body } from "express-validator";
import { cloneRepository } from "../controllers/repositoryController.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.post(
  "/clone",
  [body("githubUrl").trim().notEmpty().withMessage("githubUrl is required")],
  validate,
  cloneRepository
);

export default router;
