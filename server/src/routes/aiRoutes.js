import { Router } from "express";
import { body } from "express-validator";
import { askAboutRepository } from "../controllers/aiController.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post(
  "/ask",
  protect,
  [
    body("githubUrl").trim().notEmpty().withMessage("githubUrl is required"),
    body("question").trim().notEmpty().withMessage("question is required"),
  ],
  validate,
  askAboutRepository
);

export default router;
