import { Prisma } from '../../prisma/client/client'
import { prisma } from '../lib/prisma'

class PrismaSuggestionRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx ?? prisma
  }

  public async create(newSuggestion: Prisma.SuggestionCreateInput) {
    const suggestion = await prisma.suggestion.create({
      data: newSuggestion,
    })
    return suggestion
  }

  public async findAll() {
    const suggestions = await prisma.suggestion.findMany()
    return suggestions
  }

  public async findById(suggestionId: number) {
    const suggestion = await prisma.suggestion.findUnique({
      where: {
        id: suggestionId,
      },
    })
    return suggestion
  }

  public async findByProposalId(proposalId: number) {
    const suggestion = await prisma.suggestion.findMany({
      where: {
        proposalId: proposalId,
      },
    })
    return suggestion
  }

  public async updateSuggestionsWithoutRegisteredEmployee(
    employeeId: number,
    employeeRe: number,
    tx?: Prisma.TransactionClient,
  ) {
    const db = this.getClient(tx)
    const suggestions = await db.suggestion.updateMany({
      where: {
        employeeRe: employeeRe,
      },
      data: {
        employeeId: employeeId,
      },
    })
    return suggestions
  }

  public async delete(suggestionId: number) {
    const suggestion = await prisma.suggestion.delete({
      where: {
        id: suggestionId,
      },
    })
    return suggestion
  }

  public async update(suggestionId: number, updatedSuggestion: Prisma.SuggestionUpdateInput) {
    const suggestion = await prisma.suggestion.update({
      where: {
        id: suggestionId,
      },
      data: updatedSuggestion,
    })
    return suggestion
  }
}

export { PrismaSuggestionRepository }
