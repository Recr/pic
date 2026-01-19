import { Prisma } from "../../prisma/client/client";
import { prisma } from "../lib/prisma";

class PrismaEmployeeRepository {
  public async findAll() {
    const employees = prisma.employee.findMany()
    return employees
  }
  
  public async findById(employeeId: number) {
    const employee = prisma.employee.findUnique({
      where: {
        id: employeeId
      },
    })
    return employee
  }

  public async findByRe(employeeRe: number) {
    const employee = prisma.employee.findUnique({
      where: {
        re: employeeRe
      }
    })
    return employee
  }

  public async create(newEmployee: Prisma.EmployeeCreateInput) {
    const employee = prisma.employee.create({
      data: newEmployee
    })
    return employee
  }

  public async delete(employeeId: number) {
    const employee = prisma.employee.delete({
      where: {
        id: employeeId
      }
    })
    return employee
  }

  public async update(employeeId: number, updatedEmployee: Prisma.EmployeeUpdateInput) {
    const employee = prisma.employee.update({
      where: {
        id: employeeId
      },
      data: updatedEmployee
    })
    return employee
  }
}

export { PrismaEmployeeRepository }