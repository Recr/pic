import { Router } from "express"
import { areaRoutes } from "./routes/areas.routes"
import { employeeRoutes } from "./routes/employees.routes"
import { errorHandler } from "../middlewares/error-handling.middleware"

const appRoutes = Router()

appRoutes.use('/areas', areaRoutes)
appRoutes.use('/employees', employeeRoutes)
appRoutes.use(errorHandler)

export { appRoutes }
