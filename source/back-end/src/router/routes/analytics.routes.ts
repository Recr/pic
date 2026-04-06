import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middeware'
import { checkRole } from '../../middlewares/role.middleware'
import { Role } from '../../utils/types/employees.types'
import { AnalyticsController } from '../../controllers/analytics.controller'

const analyticsRoutes = Router()

analyticsRoutes.get(
  '/proposals',
  authMiddleware,
  checkRole([Role.ADMIN]),
  AnalyticsController.handleGetProposalAnalytics,
)

export { analyticsRoutes }
