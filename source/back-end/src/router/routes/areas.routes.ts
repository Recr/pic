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

const areaRoutes = Router()

areaRoutes.get('/', AreasController.handleFindAll)
areaRoutes.get('/:id', authMiddleware, validate(getAreaByIdSchema), AreasController.handleFindById)
areaRoutes.post('/', authMiddleware, validate(createAreaSchema), AreasController.handleCreate)
areaRoutes.put('/:id', authMiddleware, validate(updateAreaSchema), AreasController.handleUpdate)
areaRoutes.delete('/:id', authMiddleware, validate(deleteAreaSchema), AreasController.handleDelete)

export { areaRoutes }
