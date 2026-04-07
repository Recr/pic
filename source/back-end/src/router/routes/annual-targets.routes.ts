import { Router } from 'express'
import { AnnualTargetsController } from '../../controllers/annual-targets.controller'
import { authMiddleware } from '../../middlewares/auth.middeware'
import { checkRole } from '../../middlewares/role.middleware'
import { Role } from '../../utils/types/employees.types'
import { validate } from '../../middlewares/validation.middleware'
import {
  createAnnualTargetSchema,
  updateAnnualTargetSchema,
  yearParamSchema,
} from '../../utils/schemas/annual-target.schemas'

const annualTargetRoutes = Router()

annualTargetRoutes.post(
  '/',
  authMiddleware,
  checkRole([Role.ADMIN]),
  validate(createAnnualTargetSchema),
  AnnualTargetsController.handleCreateAnnualTarget,
)
annualTargetRoutes.get(
  '/',
  authMiddleware,
  checkRole([Role.ADMIN]),
  AnnualTargetsController.handleGetAllAnnualTargets,
)
annualTargetRoutes.get(
  '/:year',
  authMiddleware,
  checkRole([Role.ADMIN]),
  validate(yearParamSchema),
  AnnualTargetsController.handleGetAnnualTargetByYear,
)
annualTargetRoutes.put(
  '/:year',
  authMiddleware,
  checkRole([Role.ADMIN]),
  validate(updateAnnualTargetSchema),
  AnnualTargetsController.handleUpdateAnnualTargetByYear,
)
annualTargetRoutes.delete(
  '/:year',
  authMiddleware,
  checkRole([Role.ADMIN]),
  validate(yearParamSchema),
  AnnualTargetsController.handleDeleteAnnualTargetByYear,
)

export { annualTargetRoutes }
