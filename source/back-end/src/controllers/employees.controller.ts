import { NextFunction, Request, Response } from 'express'
import { Prisma } from '../../prisma/client/client'
import { CreateEmployeeInput } from '../utils/types/employees.types'
import { makeEmployeeUseCase } from '../factories/make-employee-use-case.factory'

export const EmployeesController = {
  async handleFindAll(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeUseCase = makeEmployeeUseCase()
      const employees = await employeeUseCase.executeFindAll()
      res.send(employees)
    } catch (error) {
      next(error)
    }
  },

  async handleFindAllForForms(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeUseCase = makeEmployeeUseCase()
      const employees = await employeeUseCase.executeFindAllForForms()
      res.send(employees)
    } catch (error) {
      next(error)
    }
  },

  async handleFindById(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = Number(req.params.id)
      const employeeUseCase = makeEmployeeUseCase()
      const employee = await employeeUseCase.executeFindById(employeeId)
      res.send(employee)
    } catch (error) {
      next(error)
    }
  },

  async handleFindByRe(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeRe = Number(req.params.re)
      const employeeUseCase = makeEmployeeUseCase()
      const employee = await employeeUseCase.executeFindByRe(employeeRe)
      res.send(employee)
    } catch (error) {
      next(error)
    }
  },

  async handleFindManyByRe(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeRe = Number(req.params.re)

      const employeeUseCase = makeEmployeeUseCase()
      const employee = await employeeUseCase.executeFindByRe(employeeRe)
      res.send(employee)
    } catch (error) {
      next(error)
    }
  },

  async handleFindUnregistered(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeUseCase = makeEmployeeUseCase()
      const employees = await employeeUseCase.executeFindUnregisteredEmployees()
      res.send(employees)
    } catch (error) {
      next(error)
    }
  },

  async handleFindAllPasswordResetRequesters(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeUseCase = makeEmployeeUseCase()
      const employees = await employeeUseCase.executeFindAllPasswordResetRequesters()
      res.send(employees)
    } catch (error) {
      next(error)
    }
  },

  async handleCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateEmployeeInput = req.body
      const employeeUseCase = makeEmployeeUseCase()
      const employee = await employeeUseCase.executeCreate(data)
      res.send(employee)
    } catch (error) {
      next(error)
    }
  },

  async handleDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = Number(req.params.id)
      const employeeUseCase = makeEmployeeUseCase()
      const employee = await employeeUseCase.executeDelete(employeeId)
      res.send(employee)
    } catch (error) {
      next(error)
    }
  },

  async handleUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = Number(req.params.id)
      const data: Prisma.EmployeeUpdateInput = req.body
      const employeeUseCase = makeEmployeeUseCase()
      const employee = await employeeUseCase.executeUpdate(employeeId, data)
      res.send(employee)
    } catch (error) {
      next(error)
    }
  },
}
