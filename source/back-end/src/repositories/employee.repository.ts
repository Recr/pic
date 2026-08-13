import { Prisma } from '../../prisma/client/client'
import { prisma } from '../lib/prisma'

class PrismaEmployeeRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx ?? prisma
  }

  public async findAll() {
    const employees = await prisma.employee.findMany({
      orderBy: {
        re: 'asc',
      },
    })
    return employees
  }

  public async findAllWithToken() {
    const employees = await prisma.employee.findMany({
      where: {
        passwordToken: {
          not: null,
        },
      },
    })
    return employees
  }

  public async findById(employeeId: number) {
    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
    })
    return employee
  }

  public async findByRe(employeeRe: number) {
    const employee = await prisma.employee.findUnique({
      where: {
        re: employeeRe,
      },
    })
    return employee
  }

  public async findByReWithPassword(employeeRe: number) {
    const employee = await prisma.employee.findUnique({
      where: {
        re: employeeRe,
      },
      omit: {
        passwordHash: false,
      },
    })
    return employee
  }

  public async findByReWithToken(employeeRe: number) {
    const employee = await prisma.employee.findUnique({
      where: {
        re: employeeRe,
      },
      omit: {
        passwordToken: false,
      },
    })
    return employee
  }

  public async findByIdWithPassword(employeeId: number) {
    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      omit: {
        passwordHash: false,
      },
    })
    return employee
  }

  public async findManyByRe(employeeRes: number[]) {
    const employees = await prisma.employee.findMany({
      where: {
        re: { in: employeeRes },
      },
    })
    return employees
  }

  public async findUnregisteredEmployeesOnSuggestions(tx?: Prisma.TransactionClient) {
    const db = this.getClient(tx)
    const suggestions = await db.suggestion.findMany({
      where: {
        employeeId: null,
      },
      distinct: ['employeeRe'],
      orderBy: {
        employeeRe: 'asc',
      },
      select: {
        employeeRe: true,
        employeeName: true,
        employeeShift: true,
      },
    })
    return suggestions
  }

  public async create(newEmployee: Prisma.EmployeeCreateInput, tx?: Prisma.TransactionClient) {
    const db = this.getClient(tx)
    const employee = await db.employee.create({
      data: newEmployee,
    })
    return employee
  }

  public async delete(employeeId: number) {
    const employee = await prisma.employee.delete({
      where: {
        id: employeeId,
      },
    })
    return employee
  }

  public async update(employeeId: number, updatedEmployee: Prisma.EmployeeUpdateInput) {
    const employee = await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: updatedEmployee,
    })
    return employee
  }
}

export { PrismaEmployeeRepository }
