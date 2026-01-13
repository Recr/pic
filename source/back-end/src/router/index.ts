import { Router } from "express"
import { areaRoutes } from "./routes/areas.routes"
import { employeeRoutes } from "./routes/employees.routes"

const appRoutes = Router()

appRoutes.use('/areas', areaRoutes)
appRoutes.use('/employees', employeeRoutes)

export { appRoutes }
