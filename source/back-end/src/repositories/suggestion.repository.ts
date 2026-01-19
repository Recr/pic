import { Prisma } from "../../prisma/client/client";
import { prisma } from "../lib/prisma";

class PrismaSuggestionRepository {
  public async create (newSuggestion: Prisma.SuggestionCreateInput) {
    const suggestion = await prisma.suggestion.create({
      data: newSuggestion
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
        id: suggestionId
      }
    })
    return suggestion
  }

  public async delete(suggestionId: number) {
    const suggestion = await prisma.suggestion.delete({
      where: {
        id: suggestionId
      }
    })
    return suggestion
  }

  public async update(suggestionId: number, updatedSuggestion: Prisma.SuggestionUpdateInput) {
    const suggestion = await prisma.suggestion.update({
      where: {
        id: suggestionId
      },
      data: updatedSuggestion
    })
    return suggestion
  }
}

export { PrismaSuggestionRepository }