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
        expiresIn: '1d',
      },
    )

    const tokenHash = await bcrypt.hash(refreshToken, 10)

    await this.refreshTokenRepository.create(
      tokenHash,
      user.id,
      new Date(Date.now() + 24 * 60 * 60 * 1000),
    )

    return { accessToken, refreshToken, user: safeUser }
  }

  public async executeRefreshToken(oldRefreshToken: string) {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
    if (!accessTokenSecret)
      throw new AppError('ACCESS_TOKEN_SECRET not configured', StatusCodes.INTERNAL_SERVER_ERROR)
    if (!refreshTokenSecret)
      throw new AppError('REFRESH_TOKEN_SECRET not configured', StatusCodes.INTERNAL_SERVER_ERROR)

    try {
      const payload = jwt.verify(oldRefreshToken, refreshTokenSecret) as jwt.JwtPayload
      const employeeId = Number(payload.sub)

      if (isNaN(employeeId)) {
        throw new AppError('Invalid refresh token.', StatusCodes.UNAUTHORIZED)
      }

      const tokenRecord = await this.refreshTokenRepository.findByEmployeeId(employeeId)
      if (!tokenRecord) {
        throw new AppError('Invalid refresh token.', StatusCodes.UNAUTHORIZED)
      }

      const isValidToken = await bcrypt.compare(oldRefreshToken, tokenRecord.tokenHash)
      if (!isValidToken) {
        throw new AppError('Invalid refresh token.', StatusCodes.UNAUTHORIZED)
      }

      const accessToken = jwt.sign(
        { name: payload.name, sub: payload.sub, role: payload.role },
        accessTokenSecret,
        { expiresIn: '15m' },
      )
      const refreshTokenTtlSeconds = Math.floor(
        (tokenRecord.expiresAt.getTime() - Date.now()) / 1000,
      )
      if (refreshTokenTtlSeconds <= 0) {
        throw new AppError('Invalid refresh token.', StatusCodes.UNAUTHORIZED)
      }

      const newRefreshToken = jwt.sign(
        { name: payload.name, sub: payload.sub, role: payload.role },
        refreshTokenSecret,
        { expiresIn: refreshTokenTtlSeconds },
      )

      const newTokenHash = await bcrypt.hash(newRefreshToken, 10)
      await this.refreshTokenRepository.rotate(
        tokenRecord.id,
        newTokenHash,
        employeeId,
        tokenRecord.expiresAt,
      )

      return { accessToken, refreshToken: newRefreshToken }
    } catch {
      throw new AppError('Invalid refresh token.', StatusCodes.UNAUTHORIZED)
    }
  }

  public async executeLogout(refreshToken: string) {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET
    if (!refreshTokenSecret)
      throw new AppError('REFRESH_TOKEN_SECRET not configured', StatusCodes.INTERNAL_SERVER_ERROR)

    try {
      const payload = jwt.verify(refreshToken, refreshTokenSecret) as jwt.JwtPayload
      const employeeId = Number(payload.sub)

      if (isNaN(employeeId)) {
        throw new AppError('Invalid refresh token.', StatusCodes.UNAUTHORIZED)
      }

      await this.refreshTokenRepository.revokeByEmployeeId(employeeId)
    } catch {
      throw new AppError('Invalid refresh token.', StatusCodes.UNAUTHORIZED)
    }
  }
}

export { LoginUseCase }
