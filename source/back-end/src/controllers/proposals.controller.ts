import { NextFunction, Request, Response } from 'express'
import { ProposalsUseCase } from '../services/proposals.use-case'
import { PrismaProposalRepository } from '../repositories/proposal.repository'
import { CreateProposalInput, UpdateProposalStatus } from '../utils/types/proposals.types'
import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { AppError } from '../errors/AppError'
import { StatusCodes } from 'http-status-codes'

export const ProposalsController = {
  async handleFindAll(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
      )
      const proposals = await proposalUseCase.executeFindAll()
      res.send(proposals)
    } catch (error) {
      next(error)
    }
  },

  async handleFindAllWithEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
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
      )
      const proposals = await proposalUseCase.executeFindAllWithoutChampion()
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
      const proposalUseCase = new ProposalsUseCase(
        new PrismaProposalRepository(),
        new PrismaEmployeeRepository(),
      )
      const updatedProposal = await proposalUseCase.executeDefineChampion(proposalId, data)
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
      )
      const updatedProposal = await proposalUseCase.executeChampionReview(proposalId, data.status)
      res.send(updatedProposal)
    } catch (error) {
      next(error)
    }
  },
}
