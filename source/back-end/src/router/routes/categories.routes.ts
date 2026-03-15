import { Router } from 'express'
import { validate } from '../../middlewares/validation.middleware'
import { CategoriesController } from '../../controllers/category.controller'
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  updateCategory,
} from '../../utils/schemas/category.schemas'
import { checkRole } from '../../middlewares/role.middleware'
import { Role } from '../../utils/types/employees.types'

const categoryRoutes = Router()

categoryRoutes.post(
  '/',
  validate(createCategory),
  checkRole([Role.ADMIN]),
  CategoriesController.handleCreate,
)
categoryRoutes.get('/', CategoriesController.handleFindAll)
categoryRoutes.get(
  '/:id',
  validate(getCategoryById),
  checkRole([Role.ADMIN]),
  CategoriesController.handleFindById,
)
categoryRoutes.delete(
  '/:id',
  validate(deleteCategory),
  checkRole([Role.ADMIN]),
  CategoriesController.handleDelete,
)
categoryRoutes.put(
  '/:id',
  validate(updateCategory),
  checkRole([Role.ADMIN]),
  CategoriesController.handleUpdate,
)

export { categoryRoutes }
