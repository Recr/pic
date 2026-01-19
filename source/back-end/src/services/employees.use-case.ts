import bcrypt from "bcrypt";
import { Prisma } from "../../prisma/client/client";
import { PrismaEmployeeRepository } from "../repositories/employee.repository";
import { CreateEmployeeInput } from "../utils/types/employees.types";

const SALT_ROUNDS = 12

class EmployeesUseCase {
  constructor (
    private employeeRepository: PrismaEmployeeRepository
  ) {}

  public async executeFindAll() {
    const employees = await this.employeeRepository.findAll()
    return employees
  }

  public async executeFindById(employeeId: number) {
    const employee = await this.employeeRepository.findById(employeeId)
    return employee
  }

  public async executeCreate({ password, ...data }: CreateEmployeeInput) {
    // TODO: verify "re" existence and throw error
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const newEmployee = {
      ...data,
      passwordHash
    }
    const employee = await this.employeeRepository.create(newEmployee)
    return employee
  }

  public async executeDelete(employeeId: number) {
    const employee = await this.employeeRepository.delete(employeeId)
    return employee
  }

  public async executeUpdate(employeeId: number, updatedEmployee: Prisma.EmployeeUpdateInput) {
    const employee = await this.employeeRepository.update(employeeId, updatedEmployee)
    return employee
  }
}

export { EmployeesUseCase }