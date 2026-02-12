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

    const secret = process.env.JWT_SECRET
    if (!secret) throw new AppError('JWT_SECRET not configured', StatusCodes.INTERNAL_SERVER_ERROR)
    const token = jwt.sign({ name: user.name, sub: user.id, role: user.role }, secret, {
      expiresIn: '1h',
    })
    return { token, user: safeUser }
  }
}

export { LoginUseCase }
