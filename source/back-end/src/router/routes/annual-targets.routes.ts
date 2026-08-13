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
  checkRole([Role.ADMIN, Role.GENERAL_MANAGER]),
  validate(createAnnualTargetSchema),
  AnnualTargetsController.handleCreateAnnualTarget,
)
annualTargetRoutes.get(
  '/',
  authMiddleware,
  checkRole([Role.ADMIN, Role.GENERAL_MANAGER]),
  AnnualTargetsController.handleGetAllAnnualTargets,
)
annualTargetRoutes.get(
  '/:year',
  authMiddleware,
  checkRole([Role.ADMIN, Role.GENERAL_MANAGER]),
  validate(yearParamSchema),
  AnnualTargetsController.handleGetAnnualTargetByYear,
)
annualTargetRoutes.put(
  '/:year',
  authMiddleware,
  checkRole([Role.ADMIN, Role.GENERAL_MANAGER]),
  validate(updateAnnualTargetSchema),
  AnnualTargetsController.handleUpdateAnnualTargetByYear,
)
annualTargetRoutes.delete(
  '/:year',
  authMiddleware,
  checkRole([Role.ADMIN, Role.GENERAL_MANAGER]),
  validate(yearParamSchema),
  AnnualTargetsController.handleDeleteAnnualTargetByYear,
)

export { annualTargetRoutes }
