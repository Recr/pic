import { expect, test, vi, describe } from 'vitest'
import { PrismaEmployeeRepository } from '../../../repositories/employee.repository'
vi.mock('../../../lib/prisma')

import prisma from '../../../lib/__mocks__/prisma'
import { Employee, Suggestion } from '../../../../prisma/client/client'

describe('EmployeeRepository', () => {
  test('should find employees with a password token', async () => {
    const mockEmployees: Employee[] = [
      {
        id: 1,
        name: 'John Doe',
        role: 'OPERATOR',
        shift: '1',
        re: 123,
        email: 'john.doe@example.com',
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
        email: 'jane.smith@example.com',
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

  test('should find an employee by RE with password hash', async () => {
    const mockEmployee: Employee = {
      id: 1,
      name: 'John Doe',
      role: 'OPERATOR',
      shift: '1',
      re: 123,
      email: 'john.doe@example.com',
      passwordHash: 'hashedpassword',
      passwordToken: null,
      mustChangePassword: false,
    }

    prisma.employee.findUnique.mockResolvedValue(mockEmployee)

    const employeeRepository = new PrismaEmployeeRepository()
    const employee = await employeeRepository.findByReWithPassword(123)

    expect(prisma.employee.findUnique).toHaveBeenCalledWith({
      where: {
        re: 123,
      },
      omit: {
        passwordHash: false,
      },
    })

    expect(employee).toStrictEqual(mockEmployee)
  })

  test('should find an employee by RE with token', async () => {
    const mockEmployee: Employee = {
      id: 1,
      name: 'John Doe',
      role: 'OPERATOR',
      shift: '1',
      re: 123,
      email: 'john.doe@example.com',
      passwordHash: 'hashedpassword',
      passwordToken: 'token123',
      mustChangePassword: false,
    }

    prisma.employee.findUnique.mockResolvedValue(mockEmployee)

    const employeeRepository = new PrismaEmployeeRepository()
    const employee = await employeeRepository.findByReWithToken(123)

    expect(prisma.employee.findUnique).toHaveBeenCalledWith({
      where: {
        re: 123,
      },
      omit: {
        passwordToken: false,
      },
    })

    expect(employee).toStrictEqual(mockEmployee)
  })

  test('should find an employee by ID with password hash', async () => {
    const mockEmployee: Employee = {
      id: 15,
      name: 'John Doe',
      role: 'OPERATOR',
      shift: '1',
      re: 123,
      email: 'john.doe@example.com',
      passwordHash: 'hashedpassword',
      passwordToken: 'token123',
      mustChangePassword: false,
    }

    prisma.employee.findUnique.mockResolvedValue(mockEmployee)

    const employeeRepository = new PrismaEmployeeRepository()
    const employee = await employeeRepository.findByIdWithPassword(15)

    expect(prisma.employee.findUnique).toHaveBeenCalledWith({
      where: {
        id: 15,
      },
      omit: {
        passwordHash: false,
      },
    })

    expect(employee).toStrictEqual(mockEmployee)
  })

  test('should find all unregistered employees on suggestions', async () => {
    const mockSuggestions: Suggestion[] = [
      {
        id: 1,
        employeeId: null,
        employeeRe: 123,
        proposalId: 1,
        employeeName: 'John Doe',
        employeeShift: '1',
      },
      {
        id: 2,
        employeeId: null,
        employeeRe: 456,
        proposalId: 2,
        employeeName: 'Jane Smith',
        employeeShift: 'ADM',
      },
    ]

    const mockSuggestionsWithoutIds = mockSuggestions.map((suggestion) => ({
      employeeRe: suggestion.employeeRe,
      employeeName: suggestion.employeeName,
      employeeShift: suggestion.employeeShift,
    }))

    prisma.suggestion.findMany.mockResolvedValue(mockSuggestionsWithoutIds as Suggestion[])

    const suggestionRepository = new PrismaEmployeeRepository()
    const unregisteredEmployees =
      await suggestionRepository.findUnregisteredEmployeesOnSuggestions()

    expect(prisma.suggestion.findMany).toHaveBeenCalledWith({
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

    expect(unregisteredEmployees).toStrictEqual(mockSuggestionsWithoutIds)
  })
})
