import { Router } from 'express'
import { Role } from '../../utils/types/employees.types'
import { AnalyticsController } from '../../controllers/analytics.controller'
import { validate } from '../../middlewares/validation.middleware'
import { timeToCommunicationAndImplementationSchema } from '../../utils/schemas/analytics.schemas'
import { apiKeyOr } from '../../middlewares/api-key.middleware'
import { authMiddleware } from '../../middlewares/auth.middeware'
import { checkRole } from '../../middlewares/role.middleware'

const analyticsRoutes = Router()

analyticsRoutes.get(
  '/proposals',
  apiKeyOr('ANALYTICS_API_KEY', authMiddleware, checkRole([Role.ADMIN, Role.GENERAL_MANAGER])),
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
