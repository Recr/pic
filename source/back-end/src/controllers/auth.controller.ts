import { NextFunction, Request, Response } from 'express'
import { LoginUseCase } from '../services/login.use-case'
import { PrismaEmployeeRepository } from '../repositories/employee.repository'

export const AuthController = {
  async handleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body
      const loginUseCase = await new LoginUseCase(new PrismaEmployeeRepository())
      const { accessToken, refreshToken, user } = await loginUseCase.executeLogin(data)
      res.json({ accessToken, refreshToken, user })
    } catch (error) {
      next(error)
    }
  },
}
