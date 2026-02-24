import { NextFunction, Request, Response } from 'express'
import { LoginUseCase } from '../services/login.use-case'
import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { RefreshTokenRepository } from '../repositories/refresh-token.repository'

export const AuthController = {
  async handleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body
      const loginUseCase = await new LoginUseCase(
        new PrismaEmployeeRepository(),
        new RefreshTokenRepository(),
      )
      const { accessToken, refreshToken, user } = await loginUseCase.executeLogin(data)

      const isProduction = process.env.NODE_ENV === 'production'

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      })

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      })

      res.json({ user })
    } catch (error) {
      next(error)
    }
  },
}
