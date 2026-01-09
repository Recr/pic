import { Router } from "express"
import { AreasController } from "../../controllers/areas.controller"

const areaRoutes = Router()

areaRoutes.get('/', AreasController.handleFindAll)
areaRoutes.post('/', AreasController.handleCreate)
areaRoutes.put('/:id', AreasController.handleUpdate)
areaRoutes.delete('/:id', AreasController.handleDelete)


export { areaRoutes }
