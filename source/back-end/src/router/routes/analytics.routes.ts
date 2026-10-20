import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middeware'
import { checkRole } from '../../middlewares/role.middleware'
import { Role } from '../../utils/types/employees.types'
import { AnalyticsController } from '../../controllers/analytics.controller'
import { validate } from '../../middlewares/validation.middleware'
import {
  proposalsAnalyticsSchema,
  timeToCommunicationAndImplementationSchema,
} from '../../utils/schemas/analytics.schemas'

const analyticsRoutes = Router()

analyticsRoutes.get(
  '/proposals',
  authMiddleware,
  checkRole([Role.ADMIN, Role.GENERAL_MANAGER]),
  validate(proposalsAnalyticsSchema),
  AnalyticsController.handleGetProposalAnalytics,
)

analyticsRoutes.get(
  '/time-to-communication-and-implementation',
  authMiddleware,
  checkRole([Role.ADMIN, Role.GENERAL_MANAGER]),
  validate(timeToCommunicationAndImplementationSchema),
  AnalyticsController.handleGetTimeToCommunicationAndImplementation,
)

analyticsRoutes.get(
  '/pending-and-completed-payments',
  authMiddleware,
  checkRole([Role.ADMIN, Role.GENERAL_MANAGER]),
  AnalyticsController.handleGetPendingAndCompletedPayments,
)

export { analyticsRoutes }
