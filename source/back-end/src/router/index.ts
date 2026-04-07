import { Router } from 'express'
import { areaRoutes } from './routes/areas.routes'
import { employeeRoutes } from './routes/employees.routes'
import { errorHandler } from '../middlewares/error-handling.middleware'
import { categoryRoutes } from './routes/categories.routes'
import { proposalsRoutes } from './routes/proposals.routes'
import { authRoutes } from './routes/auth.routes'
import { authMiddleware } from '../middlewares/auth.middeware'
import { payoutRoutes } from './routes/payout.routes'
import { analyticsRoutes } from './routes/analytics.routes'
import { annualTargetRoutes } from './routes/annual-targets.routes'

const appRoutes = Router()

appRoutes.use('/areas', areaRoutes)
appRoutes.use('/employees', employeeRoutes)
appRoutes.use('/categories', authMiddleware, categoryRoutes)
appRoutes.use('/proposals', proposalsRoutes)
appRoutes.use('/auth', authRoutes)
appRoutes.use('/payouts', payoutRoutes)
appRoutes.use('/analytics', analyticsRoutes)
appRoutes.use('/annual-targets', annualTargetRoutes)
appRoutes.use(errorHandler)

export { appRoutes }
