import { Router } from "express";
import { getCategories, getSkills } from "../controllers/metadataController";

const router = Router();

router.get("/categories", getCategories);

router.get("/skills", getSkills);

export default router;
