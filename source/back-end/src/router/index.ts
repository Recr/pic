import { Router } from "express"
import { areaRoutes } from "./routes/areas.routes"

const appRoutes = Router()

appRoutes.use('/areas', areaRoutes)

export { appRoutes }
