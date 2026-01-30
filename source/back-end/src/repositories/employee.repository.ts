import { Prisma } from "../../prisma/client/client";
import { prisma } from "../lib/prisma";

class PrismaEmployeeRepository {
  public async findAll() {
    const employees = await prisma.employee.findMany();
    return employees;
  }

  public async findById(employeeId: number) {
    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
    });
    return employee;
  }

  public async findByRe(employeeRe: number) {
    const employee = await prisma.employee.findUnique({
      where: {
        re: employeeRe,
      },
    });
    return employee;
  }

  public async findManyByRe(employeeRes: number[]) {
    const employees = await prisma.employee.findMany({
      where: {
        re: { in: employeeRes },
      },
    });
    return employees;
  }

  public async create(newEmployee: Prisma.EmployeeCreateInput) {
    const employee = await prisma.employee.create({
      data: newEmployee,
    });
    return employee;
  }

  public async delete(employeeId: number) {
    const employee = await prisma.employee.delete({
      where: {
        id: employeeId,
      },
    });
    return employee;
  }

  public async update(
    employeeId: number,
    updatedEmployee: Prisma.EmployeeUpdateInput,
  ) {
    const employee = await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: updatedEmployee,
    });
    return employee;
  }
}

export { PrismaEmployeeRepository };
