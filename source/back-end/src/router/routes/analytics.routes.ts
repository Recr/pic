import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middeware'
import { checkRole } from '../../middlewares/role.middleware'
import { Role } from '../../utils/types/employees.types'
import { AnalyticsController } from '../../controllers/analytics.controller'

const analyticsRoutes = Router()

analyticsRoutes.get(
  '/proposals',
  authMiddleware,
  checkRole([Role.ADMIN, Role.GENERAL_MANAGER]),
  AnalyticsController.handleGetProposalAnalytics,
)

analyticsRoutes.get(
  '/time-to-communication-and-implementation',
  authMiddleware,
  checkRole([Role.ADMIN, Role.GENERAL_MANAGER]),
  AnalyticsController.handleGetTimeToCommunicationAndImplementation,
)

analyticsRoutes.get(
  '/pending-and-completed-payments',
  authMiddleware,
  checkRole([Role.ADMIN, Role.GENERAL_MANAGER]),
  AnalyticsController.handleGetPendingAndCompletedPayments,
)

export { analyticsRoutes }
