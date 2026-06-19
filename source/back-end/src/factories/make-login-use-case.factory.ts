import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { PrismaRefreshTokenRepository } from '../repositories/refresh-token.repository'
import { LoginUseCase } from '../services/login.use-case'

function makeLoginUseCase() {
  const employeeRepository = new PrismaEmployeeRepository()
  const refreshTokenRepository = new PrismaRefreshTokenRepository()
  const usecase = new LoginUseCase(employeeRepository, refreshTokenRepository)

  return usecase
}

export { makeLoginUseCase }
