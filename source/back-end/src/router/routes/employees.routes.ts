import { Router } from 'express'
import { EmployeesController } from '../../controllers/employees.controller'
import { validate } from '../../middlewares/validation.middleware'
import {
  createEmployeeSchema,
  deleteEmployeeSchema,
  getEmployeeByIdSchema,
  getEmployeeByReSchema,
  updateEmployeeSchema,
} from '../../utils/schemas/employee.schema'
import { authMiddleware } from '../../middlewares/auth.middeware'

const employeeRoutes = Router()

employeeRoutes.get('/', EmployeesController.handleFindAll)
employeeRoutes.get(
  '/:id',
  authMiddleware,
  validate(getEmployeeByIdSchema),
  EmployeesController.handleFindById,
)
employeeRoutes.get(
  '/re/:re',
  authMiddleware,
  validate(getEmployeeByReSchema),
  EmployeesController.handleFindByRe,
)
employeeRoutes.post(
  '/',
  authMiddleware,
  validate(createEmployeeSchema),
  EmployeesController.handleCreate,
)
employeeRoutes.put(
  '/:id',
  authMiddleware,
  validate(updateEmployeeSchema),
  EmployeesController.handleUpdate,
)
employeeRoutes.delete(
  '/:id',
  authMiddleware,
  validate(deleteEmployeeSchema),
  EmployeesController.handleDelete,
)

export { employeeRoutes }
