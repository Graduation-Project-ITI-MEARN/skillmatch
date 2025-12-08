import { Router } from "express";
import { getCategories, getSkills } from "../controllers/metadataController";

const metadataRouter = Router();

metadataRouter.get("/categories", getCategories);

metadataRouter.get("/skills", getSkills);

export default metadataRouter;
