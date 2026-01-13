import { NextFunction, Request, Response } from "express";
import { EmployeesUseCase } from "../services/employees.use-case";
import { PrismaEmployeeRepository } from "../repositories/employee.repository";
import { Prisma } from "../../prisma/client/client";

export const EmployeesController = {
  async handleFindAll(req: Request, res: Response, next: NextFunction) {
    try  {
      const employeeUseCase = new EmployeesUseCase(new PrismaEmployeeRepository())
      const employees = employeeUseCase.executeFindAll()
      res.send(employees)
    } catch (error) {
      next(error)
    }
  },

  async handleFindById(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = Number(req.params.id)
      const employeeUseCase = new EmployeesUseCase(new PrismaEmployeeRepository())
      const employee = employeeUseCase.executeFindById(employeeId)
      res.send(employee)
    } catch (error) {
      next(error)
    }
  },

  async handleCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const data: Prisma.EmployeeCreateInput = req.body
      const employeeUseCase = new EmployeesUseCase( new PrismaEmployeeRepository())
      const employee = employeeUseCase.executeCreate(data)
      res.send(employee)
    } catch (error) {
      next(error)
    }
  },

  async handleDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = Number(req.params.id)
      const employeeUseCase = new EmployeesUseCase( new PrismaEmployeeRepository())
      const employee = employeeUseCase.executeDelete(employeeId)
      res.send(employee)
    } catch(error) {
      next(error)
    }
  },

  async handleUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = Number(req.params.id)
      const data: Prisma.EmployeeUpdateInput = req.body
      const employeeUseCase = new EmployeesUseCase( new PrismaEmployeeRepository())
      const employee = employeeUseCase.executeUpdate(employeeId, data)
      res.send(employee)
    } catch(error) {
      next(error)
    }
  }
}