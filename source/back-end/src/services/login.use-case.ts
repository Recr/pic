import { StatusCodes } from 'http-status-codes'
import { AppError } from '../errors/AppError'
import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { LoginInput } from '../utils/types/login.types'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

class LoginUseCase {
  constructor(private employeeRepository: PrismaEmployeeRepository) {}

  public async executeLogin(loginData: LoginInput) {
    const user = await this.employeeRepository.findByReWithPassword(loginData.re)
    if (!user || !(await bcrypt.compare(loginData.password, user.passwordHash)))
      throw new AppError('Invalid Credentials.', StatusCodes.UNAUTHORIZED)

    const { passwordHash: _, ...safeUser } = user

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
    if (!accessTokenSecret)
      throw new AppError('ACCESS_TOKEN_SECRET not configured', StatusCodes.INTERNAL_SERVER_ERROR)
    const accessToken = jwt.sign(
      { name: user.name, sub: user.id, role: user.role },
      accessTokenSecret,
      {
        expiresIn: '15m',
      },
    )

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET
    if (!refreshTokenSecret)
      throw new AppError('REFRESH_TOKEN_SECRET not configured', StatusCodes.INTERNAL_SERVER_ERROR)
    const refreshToken = jwt.sign(
      { name: user.name, sub: user.id, role: user.role },
      refreshTokenSecret,
      {
        expiresIn: '7d',
      },
    )
    return { accessToken, refreshToken, user: safeUser }
  }
}

export { LoginUseCase }
