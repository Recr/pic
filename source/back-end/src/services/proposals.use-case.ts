import { StatusCodes } from 'http-status-codes'
import { AppError } from '../errors/AppError'
import { PrismaProposalRepository } from '../repositories/proposal.repository'
import {
  CreateProposalInput,
  CreateProposalWithSuggestions,
  UpdateProposalWithChampion,
} from '../utils/types/proposals.types'
import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { Prisma } from '../../prisma/client/client'

class ProposalsUseCase {
  constructor(
    private proposalRepository: PrismaProposalRepository,
    private employeeRepository: PrismaEmployeeRepository,
  ) {}

  public async executeFindAll() {
    const proposals = await this.proposalRepository.findAll()
    return proposals
  }

  public async executeFindAllWithEmployees() {
    const proposals = await this.proposalRepository.findAllWithEmployees()
    const formatedProposals = proposals.map(({ suggestions, ...proposal }) => ({
      ...proposal,
      employees: suggestions.map((s) => s.employee),
    }))
    return formatedProposals
  }

  public async executeFindById(proposalId: number) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found', StatusCodes.NOT_FOUND)
    return proposal
  }

  public async executeCreate({ employeeRes, ...newProposal }: CreateProposalInput) {
    let employeeIds: number[] = []
    for (const employeeRe of employeeRes) {
      const employeeId = await this.employeeRepository.findByRe(employeeRe)
      if (!employeeId) employeeIds.push(undefined as unknown as number)
    }
    const employeeIds: number[] = (await this.employeeRepository.findManyByRe(employeeRes)).map(
      (employee) => employee.id,
    )
    if (employeeIds.length !== employeeRes.length)
      throw new AppError('Employees not found', StatusCodes.NOT_FOUND)
    const newProposalWithIds: CreateProposalWithSuggestions = {
      ...newProposal,
      employeeIds,
      employeeRes,
    }
    const proposal = await this.proposalRepository.createWithSuggestions(newProposalWithIds)
    return proposal
  }

  public async executeDefineChampion(proposalId: number, data: UpdateProposalWithChampion) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)
    const champion = await this.employeeRepository.findByRe(data.championRe)
    if (!champion) throw new AppError('Champion not found', StatusCodes.NOT_FOUND)
    const updatedData: Prisma.ProposalUpdateInput = {
      area: { connect: { id: data.areaId } },
      category: { connect: { id: data.categoryId } },
      champion: { connect: { id: champion.id } },
      status: 'UNDER_VALIDATION',
      adminReviewedAt: new Date(),
    }
    const updatedProposal = await this.proposalRepository.updateProposal(proposal.id, updatedData)
    return updatedProposal
  }

  public async executeRejection(proposalId: number) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)
    const updatedStatus: Prisma.ProposalUpdateInput = {
      status: 'REJECTED',
    }
    const updatedProposal = await this.proposalRepository.updateProposal(proposal.id, updatedStatus)
    return updatedProposal
  }
}

export { ProposalsUseCase }
