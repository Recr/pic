import { Router } from 'express'
import { areaRoutes } from './routes/areas.routes'
import { employeeRoutes } from './routes/employees.routes'
import { errorHandler } from '../middlewares/error-handling.middleware'
import { categoryRoutes } from './routes/categories.routes'
import { proposalsRoutes } from './routes/proposals.routes'
import { authRoutes } from './routes/auth.routes'

const appRoutes = Router()

appRoutes.use('/areas', areaRoutes)
appRoutes.use('/employees', employeeRoutes)
appRoutes.use('/categories', categoryRoutes)
appRoutes.use('/proposals', proposalsRoutes)
appRoutes.use('/auth/', authRoutes)
appRoutes.use(errorHandler)

export { appRoutes }
