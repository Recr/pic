import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { PrismaSuggestionRepository } from '../repositories/suggestion.repository'
import { EmployeeUseCase } from '../services/employee.use-case'

function makeEmployeeUseCase() {
  const employeeRepository = new PrismaEmployeeRepository()
  const suggestionRepository = new PrismaSuggestionRepository()

  const usecase = new EmployeeUseCase(employeeRepository, suggestionRepository)

  return usecase
}

export { makeEmployeeUseCase }
