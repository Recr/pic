import { NextFunction, Request, Response } from 'express'
import { ProposalsUseCase } from '../services/proposals.use-case'
import { PrismaProposalRepository } from '../repositories/proposal.repository'
import { CreateProposalInput, UpdateProposalStatus } from '../utils/types/proposals.types'
import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { AppError } from '../errors/AppError'
import { StatusCodes } from 'http-status-codes'
import { PrismaCategoryRepository } from '../repositories/category.repository'
import { PrismaSuggestionRepository } from '../repositories/suggestion.repository'

export const ProposalsController = {
  async handleFindAll(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
        new PrismaCategoryRepository(),
        new PrismaSuggestionRepository(),
      )
      const proposals = await proposalUseCase.executeFindAll()
      res.send(proposals)
    } catch (error) {
      next(error)
    }
  },

  async handleFindAllProposalsDetailed(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
        new PrismaCategoryRepository(),
        new PrismaSuggestionRepository(),
      )

      const proposals = await proposalUseCase.executeFindAllDetailed()
      res.send(proposals)
    } catch (error) {
      next(error)
    }
  },

  async handleFindAllUserProposalsWithEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
        new PrismaCategoryRepository(),
        new PrismaSuggestionRepository(),
      )

      const userId = Number(req.user?.sub)
      if (Number.isNaN(userId)) {
        return next(new AppError('Invalid token payload.', StatusCodes.UNAUTHORIZED))
      }

      const proposals = await proposalUseCase.executeFindAllWithEmployees(userId)
      res.send(proposals)
    } catch (error) {
      next(error)
    }
  },

  async handleFindAllWithoutChampion(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
        new PrismaCategoryRepository(),
        new PrismaSuggestionRepository(),
      )
      const role = req.user?.role
      const userId = Number(req.user?.sub)
      const proposals = await proposalUseCase.executeFindAllWithoutChampion(role, userId)
      res.send(proposals)
    } catch (error) {
      next(error)
    }
  },

  async handleFindAllWithoutManager(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
        new PrismaCategoryRepository(),
        new PrismaSuggestionRepository(),
      )
      const proposals = await proposalUseCase.executeFindAllWithoutManager()
      res.send(proposals)
    } catch (error) {
      next(error)
    }
  },

  async handleFindById(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
        new PrismaCategoryRepository(),
        new PrismaSuggestionRepository(),
      )
      const proposals = await proposalUseCase.executeFindById(proposalId)
      res.send(proposals)
    } catch (error) {
      next(error)
    }
  },

  async handleCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateProposalInput = req.body
      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
        new PrismaCategoryRepository(),
        new PrismaSuggestionRepository(),
      )
      const proposal = await proposalUseCase.executeCreate(data)
      res.send(proposal)
    } catch (error) {
      next(error)
    }
  },

  async handleDefineChampion(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body
      const proposalId = Number(req.params.id)
      const userId = Number(req.user?.sub)

      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
        new PrismaCategoryRepository(),
        new PrismaSuggestionRepository(),
      )
      const updatedProposal = await proposalUseCase.executeDefineChampion(proposalId, data, userId)
      res.send(updatedProposal)
    } catch (error) {
      next(error)
    }
  },

  async handleAdminDefineChampion(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body
      const proposalId = Number(req.params.id)

      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
        new PrismaCategoryRepository(),
        new PrismaSuggestionRepository(),
      )
      const updatedProposal = await proposalUseCase.executeAdminDefineChampion(proposalId, data)
      res.send(updatedProposal)
    } catch (error) {
      next(error)
    }
  },

  async handleDefineManager(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body
      const proposalId = Number(req.params.id)
      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
        new PrismaCategoryRepository(),
        new PrismaSuggestionRepository(),
      )
      const updatedProposal = await proposalUseCase.executeDefineManager(proposalId, data)
      res.send(updatedProposal)
    } catch (error) {
      next(error)
    }
  },

  async handleAdminRejection(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
        new PrismaCategoryRepository(),
        new PrismaSuggestionRepository(),
      )
      const updatedProposal = await proposalUseCase.executeAdminRejection(proposalId)
      res.send(updatedProposal)
    } catch (error) {
      next(error)
    }
  },

  async handleStatusUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const data: UpdateProposalStatus = req.body
      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
        new PrismaCategoryRepository(),
        new PrismaSuggestionRepository(),
      )
      const updatedProposal = await proposalUseCase.executeChampionReview(proposalId, data.status)
      res.send(updatedProposal)
    } catch (error) {
      next(error)
    }
  },
}
