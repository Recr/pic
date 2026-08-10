import { expect, test, vi, describe } from 'vitest'
import { PrismaEmployeeRepository } from '../../repositories/employee.repository'
import prisma from '../../lib/__mocks__/prisma'
vi.mock('../../lib/prisma')

describe('EmployeeRepository', () => {
  test('should correctly return the employees with a password token', async () => {
    const mockEmployees = [
      {
        id: 1,
        name: 'John Doe',
        role: 'OPERATOR',
        shift: '1',
        re: 123,
        passwordHash: 'hashedpassword',
        passwordToken: 'token123',
        mustChangePassword: false,
      },
      {
        id: 2,
        name: 'Jane Smith',
        role: 'OPERATOR',
        shift: '1',
        re: 456,
        passwordHash: 'hashedpassword2',
        passwordToken: 'token456',
        mustChangePassword: false,
      },
    ]

    prisma.employee.findMany.mockResolvedValue(mockEmployees)

    const employeeRepository = new PrismaEmployeeRepository()
    const employeesWithToken = await employeeRepository.findAllWithToken()

    expect(prisma.employee.findMany).toHaveBeenCalledWith({
      where: {
        passwordToken: {
          not: null,
        },
      },
    })

    expect(employeesWithToken).toStrictEqual(mockEmployees)
  })
})
