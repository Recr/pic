import { Router } from "express";
import { EmployeesController } from "../../controllers/employees.controller";
import { validate } from "../../middlewares/validation.middleware";
import { createEmployeeSchema, deleteEmployeeSchema, getEmployeeByIdSchema, updateEmployeeSchema } from "../../utils/schemas/employee.schema";

const employeeRoutes = Router()

employeeRoutes.get('/', EmployeesController.handleFindAll)
employeeRoutes.get('/:id', validate(getEmployeeByIdSchema), EmployeesController.handleFindById)
employeeRoutes.post('/', validate(createEmployeeSchema), EmployeesController.handleCreate)
employeeRoutes.put('/:id', validate(updateEmployeeSchema), EmployeesController.handleUpdate)
employeeRoutes.delete('/:id', validate(deleteEmployeeSchema), EmployeesController.handleDelete)

export { employeeRoutes }