import { Router } from "express";
import { AreasController } from "../../controllers/areas.controller";
import { validate } from "../../middlewares/validation.middleware";
import {
  createAreaSchema,
  deleteAreaSchema,
  getAreaByIdSchema,
  updateAreaSchema,
} from "../../utils/schemas/area.schemas";

const areaRoutes = Router();

areaRoutes.get("/", AreasController.handleFindAll);
areaRoutes.get(
  "/:id",
  validate(getAreaByIdSchema),
  AreasController.handleFindById,
);
areaRoutes.post("/", validate(createAreaSchema), AreasController.handleCreate);
areaRoutes.put(
  "/:id",
  validate(updateAreaSchema),
  AreasController.handleUpdate,
);
areaRoutes.delete(
  "/:id",
  validate(deleteAreaSchema),
  AreasController.handleDelete,
);

export { areaRoutes };
