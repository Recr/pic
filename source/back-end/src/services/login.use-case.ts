import { StatusCodes } from 'http-status-codes'
import { AppError } from '../errors/AppError'
import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { LoginInput } from '../utils/types/login.types'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { RefreshTokenRepository } from '../repositories/refresh-token.repository'

class LoginUseCase {
  constructor(
    private employeeRepository: PrismaEmployeeRepository,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

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
        expiresIn: '3m',
      },
    )

    const tokenHash = await bcrypt.hash(refreshToken, 10)

    const existingToken = await this.refreshTokenRepository.findByEmployeeId(user.id)
    if (existingToken) {
      await this.refreshTokenRepository.update(
        existingToken.id,
        tokenHash,
        new Date(Date.now() + 3 * 60 * 1000),
      )
    } else {
      await this.refreshTokenRepository.create(
        tokenHash,
        user.id,
        new Date(Date.now() + 3 * 60 * 1000),
      )
    }

    return { accessToken, refreshToken, user: safeUser }
  }
}

export { LoginUseCase }
