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
import { checkRole } from '../../middlewares/role.middleware'
import { Role } from '../../utils/types/employees.types'

const employeeRoutes = Router()

employeeRoutes.get('/', EmployeesController.handleFindAll)
employeeRoutes.get(
  '/:id',
  authMiddleware,
  validate(getEmployeeByIdSchema),
  checkRole([Role.ADMIN]),
  EmployeesController.handleFindById,
)
employeeRoutes.get(
  '/re/:re',
  authMiddleware,
  validate(getEmployeeByReSchema),
  checkRole([Role.ADMIN]),
  EmployeesController.handleFindByRe,
)
employeeRoutes.post(
  '/',
  authMiddleware,
  validate(createEmployeeSchema),
  checkRole([Role.ADMIN]),
  EmployeesController.handleCreate,
)
employeeRoutes.put(
  '/:id',
  authMiddleware,
  validate(updateEmployeeSchema),
  checkRole([Role.ADMIN]),
  EmployeesController.handleUpdate,
)
employeeRoutes.delete(
  '/:id',
  authMiddleware,
  validate(deleteEmployeeSchema),
  checkRole([Role.ADMIN]),
  EmployeesController.handleDelete,
)

export { employeeRoutes }
