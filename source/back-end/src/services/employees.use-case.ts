import bcrypt from "bcrypt";
import { Prisma } from "../../prisma/client/client";
import { PrismaEmployeeRepository } from "../repositories/employee.repository";
import { CreateEmployeeInput } from "../utils/types/employees.types";
import { AppError } from "../errors/AppError";
import { StatusCodes } from "http-status-codes";

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
    if (!employee) throw new AppError("Employee not found.", StatusCodes.NOT_FOUND)
    return employee
  }

  public async executeFindByRe(employeeRe: number) {
    const employee = await this.employeeRepository.findByRe(employeeRe)
    if (!employee) throw new AppError("Employee not found.", StatusCodes.NOT_FOUND) 
    return employee
  }

  public async executeCreate({ password, ...data }: CreateEmployeeInput) {
    const inDbEmployee = await this.employeeRepository.findByRe(data.re)
    if (inDbEmployee) throw new AppError("Employee already exists.", StatusCodes.CONFLICT)

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const newEmployee = {
      ...data,
      passwordHash
    }
    const employee = await this.employeeRepository.create(newEmployee)
    return employee
  }

  public async executeDelete(employeeId: number) {
    const employee = await this.employeeRepository.findById(employeeId)
    if (!employee) throw new AppError("Employee not found.", StatusCodes.NOT_FOUND)
    
    await this.employeeRepository.delete(employeeId)
    return employee
  }

  public async executeUpdate(employeeId: number, updatedEmployeeData: Prisma.EmployeeUpdateInput) {
    const employee = await this.employeeRepository.findById(employeeId)
    if (!employee) throw new AppError("Employee not found.", StatusCodes.NOT_FOUND)
    const updatedEmployee = await this.employeeRepository.update(employeeId, updatedEmployeeData)
    return updatedEmployee
  }
}

export { EmployeesUseCase }