import bcrypt from 'bcrypt'
import { Prisma } from '../../prisma/client/client'
import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { CreateEmployeeInput } from '../utils/types/employees.types'
import { AppError } from '../errors/AppError'
import { StatusCodes } from 'http-status-codes'
import { PrismaSuggestionRepository } from '../repositories/suggestion.repository'
import { prisma } from '../lib/prisma'
import { passwordResetTokenVault } from '../lib/password-reset-token-vault'

const SALT_ROUNDS = 12

class EmployeesUseCase {
  constructor(
    private employeeRepository: PrismaEmployeeRepository,
    private suggestionRepository: PrismaSuggestionRepository,
  ) {}

  public async executeFindAll() {
    const employees = await this.employeeRepository.findAll()
    return employees
  }

  public async executeFindById(employeeId: number) {
    const employee = await this.employeeRepository.findById(employeeId)
    if (!employee) throw new AppError('Employee not found.', StatusCodes.NOT_FOUND)
    return employee
  }

  public async executeFindByRe(employeeRe: number) {
    const employee = await this.employeeRepository.findByRe(employeeRe)
    if (!employee) throw new AppError('Employee not found.', StatusCodes.NOT_FOUND)
    return employee
  }

  public async executeFindUnregisteredEmployees() {
    const employeesBySuggestions = await this.employeeRepository.findEmployeesOnSuggestions()
    const registeredEmployeeRes = (await this.employeeRepository.findAll()).map(
      (employee) => employee.re,
    )

    const unregisteredEmployees = []
    for (const employee of employeesBySuggestions) {
      if (!registeredEmployeeRes.includes(employee.employeeRe)) {
        unregisteredEmployees.push(employee)
      }
    }
    return unregisteredEmployees
  }

  public async executeFindAllPasswordResetRequesters() {
    const employees = await this.employeeRepository.findAllWithToken()

    return employees
      .map((employee) => {
        const resetToken = passwordResetTokenVault.get(employee.id)
        if (!resetToken) return null

        return {
          ...employee,
          passwordToken: resetToken,
        }
      })
      .filter((employee): employee is NonNullable<typeof employee> => employee !== null)
  }

  public async executeCreate({ password, ...data }: CreateEmployeeInput) {
    const existingEmployee = await this.employeeRepository.findByRe(data.re)
    if (existingEmployee)
      throw new AppError('Employee with this RE already exists.', StatusCodes.CONFLICT)

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const newEmployee = {
      ...data,
      passwordHash,
    }

    const employee = await prisma.$transaction(async (tx) => {
      const unregisteredEmployeesRes = (
        await this.employeeRepository.findEmployeesOnSuggestions(tx)
      ).map((suggestion) => suggestion.employeeRe)

      const createdEmployee = await this.employeeRepository.create(newEmployee, tx)

      if (unregisteredEmployeesRes.includes(data.re)) {
        await this.suggestionRepository.updateSuggestionsWithoutRegisteredEmployee(
          createdEmployee.id,
          data.re,
          tx,
        )
      }

      return createdEmployee
    })

    return employee
  }

  public async executeDelete(employeeId: number) {
    const employee = await this.employeeRepository.findById(employeeId)
    if (!employee) throw new AppError('Employee not found.', StatusCodes.NOT_FOUND)

    await this.employeeRepository.delete(employeeId)
    return employee
  }

  public async executeUpdate(employeeId: number, updatedEmployeeData: Prisma.EmployeeUpdateInput) {
    const employee = await this.employeeRepository.findById(employeeId)
    if (!employee) throw new AppError('Employee not found.', StatusCodes.NOT_FOUND)
    const updatedEmployee = await this.employeeRepository.update(employeeId, updatedEmployeeData)
    return updatedEmployee
  }
}

export { EmployeesUseCase }
