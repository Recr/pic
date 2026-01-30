import { StatusCodes } from "http-status-codes";
import { AppError } from "../errors/AppError";
import { PrismaSuggestionRepository } from "../repositories/suggestion.repository";
import { Prisma } from "../../prisma/client/client";

class SuggestionUseCase {
  constructor(private suggestionRepository: PrismaSuggestionRepository) {}

  public async executeFindAll() {
    const suggestions = await this.suggestionRepository.findAll();
    return suggestions;
  }

  public async executeFindById(suggestionId: number) {
    const suggestion = await this.suggestionRepository.findById(suggestionId);
    if (!suggestion)
      throw new AppError("Suggestion not found.", StatusCodes.NOT_FOUND);
    return suggestion;
  }

  public async executeCreate(newSuggestion: Prisma.SuggestionCreateInput) {
    const suggestion = await this.suggestionRepository.create(newSuggestion);
    return suggestion;
  }

  public async executeDelete(suggestionId: number) {
    const existingSuggestion =
      await this.suggestionRepository.findById(suggestionId);
    if (!existingSuggestion)
      throw new AppError("Suggestion not found.", StatusCodes.NOT_FOUND);
    const suggestion = await this.suggestionRepository.delete(suggestionId);
    return suggestion;
  }

  public async executeUpdate(
    suggestionId: number,
    updatedSuggestion: Prisma.SuggestionUpdateInput,
  ) {
    const existingSuggestion =
      await this.suggestionRepository.findById(suggestionId);
    if (!existingSuggestion)
      throw new AppError("Suggestion not found.", StatusCodes.NOT_FOUND);
    const suggestion = await this.suggestionRepository.update(
      suggestionId,
      updatedSuggestion,
    );
    return suggestion;
  }
}

export { SuggestionUseCase };
