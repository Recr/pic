import { Router } from 'express'
import { AreasController } from '../../controllers/areas.controller'
import { validate } from '../../middlewares/validation.middleware'
import {
  createAreaSchema,
  deleteAreaSchema,
  getAreaByIdSchema,
  updateAreaSchema,
} from '../../utils/schemas/area.schemas'
import { authMiddleware } from '../../middlewares/auth.middeware'
import { checkRole } from '../../middlewares/role.middleware'
import { Role } from '../../utils/types/employees.types'

const areaRoutes = Router()

areaRoutes.get('/', AreasController.handleFindAll)
areaRoutes.get(
  '/:id',
  authMiddleware,
  checkRole([Role.ADMIN]),
  validate(getAreaByIdSchema),
  AreasController.handleFindById,
)
areaRoutes.post(
  '/',
  authMiddleware,
  checkRole([Role.ADMIN]),
  validate(createAreaSchema),
  AreasController.handleCreate,
)
areaRoutes.put(
  '/:id',
  authMiddleware,
  checkRole([Role.ADMIN]),
  validate(updateAreaSchema),
  AreasController.handleUpdate,
)
areaRoutes.delete(
  '/:id',
  authMiddleware,
  checkRole([Role.ADMIN]),
  validate(deleteAreaSchema),
  AreasController.handleDelete,
)

export { areaRoutes }
