import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { CategoriesController } from "../../controllers/category.controller";
import { createCategory, deleteCategory, getCategoryById, updateCategory } from "../../utils/schemas/category.schemas";

const categoryRoutes = Router()

categoryRoutes.post("/", validate(createCategory), CategoriesController.handleCreate)
categoryRoutes.get("/", CategoriesController.handleFindAll)
categoryRoutes.get("/:id", validate(getCategoryById), CategoriesController.handleFindById)
categoryRoutes.delete("/:id", validate(deleteCategory), CategoriesController.handleDelete)
categoryRoutes.put("/:id", validate(updateCategory), CategoriesController.handleUpdate)

export { categoryRoutes }
