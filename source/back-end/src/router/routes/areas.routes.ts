import { Router } from "express"
import { AreasController } from "../../controllers/areas.controller"

const areaRoutes = Router()

areaRoutes.get('/', AreasController.handleFindAll)



export { areaRoutes }
