import { StatusCodes } from 'http-status-codes'
import { AppError } from '../errors/AppError'
import { PrismaProposalRepository } from '../repositories/proposal.repository'
import {
  CreateProposalInput,
  CreateProposalWithSuggestions,
  EmployeeInfo,
  UpdateProposalWithChampion,
  UpdateProposalWithManager,
} from '../utils/types/proposals.types'
import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { Prisma } from '../../prisma/client/client'
import { PrismaCategoryRepository } from '../repositories/category.repository'
import { PrismaSuggestionRepository } from '../repositories/suggestion.repository'
import { Role } from '../utils/types/employees.types'

class ProposalsUseCase {
  constructor(
    private proposalRepository: PrismaProposalRepository,
    private employeeRepository: PrismaEmployeeRepository,
    private categoryRepository: PrismaCategoryRepository,
    private suggestionRepository: PrismaSuggestionRepository,
  ) {}

  public async executeFindAll() {
    const proposals = await this.proposalRepository.findAll()
    return proposals
  }

  public async executeFindAllWithEmployees(userId?: number) {
    const proposals = await this.proposalRepository.findAllWithEmployees(userId)
    return proposals
  }

  public async executeFindAllDetailed() {
    const proposals = await this.proposalRepository.findAllDetailed()
    return proposals
  }

  public async executeFindAllWithoutChampion(role: Role, userId: number) {
    if (role === Role.ADMIN) {
      return await this.proposalRepository.findAllWithoutChampion()
    }
    return await this.proposalRepository.findAllWithoutChampionFromManager(userId)
  }

  public async executeFindAllWithoutManager() {
    return await this.proposalRepository.findAllWithoutManager()
  }

  public async executeFindById(proposalId: number) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found', StatusCodes.NOT_FOUND)
    return proposal
  }

  public async executeCreate({
    employees: employeeWithoutIds,
    ...newProposal
  }: CreateProposalInput) {
    const employees: ((EmployeeInfo & { id: number }) | null)[] = await Promise.all(
      employeeWithoutIds.map(async (employeeWithoutId) => {
        const employeeWithId = await this.employeeRepository.findByRe(employeeWithoutId.re)

        if (!employeeWithId)
          return {
            name: employeeWithoutId.name,
            re: employeeWithoutId.re,
            shift: employeeWithoutId.shift,
          } as EmployeeInfo & { id: number }

        return { ...employeeWithoutId, id: employeeWithId.id }
      }),
    )
    const employeesWithIds = employees.filter(
      (employee): employee is EmployeeInfo & { id: number } => employee !== null,
    )

    const newProposalWithIds: CreateProposalWithSuggestions = {
      ...newProposal,
      employees: employeesWithIds,
    }
    const proposal = await this.proposalRepository.createWithSuggestions(newProposalWithIds)
    return proposal
  }

  public async executeDefineChampion(
    proposalId: number,
    data: UpdateProposalWithChampion,
    userId: number,
  ) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)

    if (proposal.managerId !== userId) {
      throw new AppError(
        'Unauthorized to define champion for this proposal.',
        StatusCodes.FORBIDDEN,
      )
    }

    const champion = await this.employeeRepository.findByRe(data.championRe)
    if (!champion) throw new AppError('Champion not found', StatusCodes.NOT_FOUND)

    const updatedData: Prisma.ProposalUpdateInput = {
      champion: { connect: { id: champion.id } },
      status: 'UNDER_VALIDATION',
      adminReviewedAt: new Date(),
    }

    const updatedProposal = await this.proposalRepository.updateProposal(proposal.id, updatedData)
    return updatedProposal
  }

  public async executeAdminDefineChampion(proposalId: number, data: UpdateProposalWithChampion) {
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

  public async executeDefineManager(proposalId: number, data: UpdateProposalWithManager) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)
    const manager = await this.employeeRepository.findByRe(data.managerRe)
    if (!manager) throw new AppError('Manager not found', StatusCodes.NOT_FOUND)
    const updatedData: Prisma.ProposalUpdateInput = {
      area: { connect: { id: data.areaId } },
      category: { connect: { id: data.categoryId } },
      manager: { connect: { id: manager.id } },
      adminReviewedAt: new Date(),
    }
    const updatedProposal = await this.proposalRepository.updateProposal(proposal.id, updatedData)
    return updatedProposal
  }

  public async executeChampionReview(proposalId: number, newStatus: string) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)
    const updatedData: Prisma.ProposalUpdateInput = { status: newStatus }

    if (newStatus == 'TO_IMPLEMENT' || newStatus == 'NOT_VIABLE' || newStatus == 'REJECTED') {
      updatedData.championReviewedAt = new Date()
    } else if (newStatus == 'IMPLEMENTATION') {
      updatedData.implementationStartedAt = new Date()
    } else if (newStatus == 'IMPLEMENTED') {
      updatedData.completedAt = new Date()

      if (!proposal.categoryId) throw new AppError('Category not defined.', StatusCodes.BAD_REQUEST)
      const category = await this.categoryRepository.findById(proposal.categoryId)
      if (category?.categoryReward == null)
        throw new AppError('Category reward not defined.', StatusCodes.BAD_REQUEST)
      updatedData.rewardAmount = category?.categoryReward

      const suggestionIdList = (await this.suggestionRepository.findByProposalId(proposal.id)).map(
        (suggestion) => {
          return suggestion.id
        },
      )

      if (suggestionIdList.length === 0)
        throw new AppError('Proposal has no suggestions.', StatusCodes.BAD_REQUEST)

      const payoutData: Prisma.PayoutCreateManyInput[] = suggestionIdList.map((id) => {
        return {
          status: 'PENDING',
          value: Number(category.categoryReward) / suggestionIdList.length,
          suggestionId: id,
        }
      })

      const completedProposal = await this.proposalRepository.completeProposal(
        proposal.id,
        updatedData,
        payoutData,
      )
      return completedProposal
    } else {
      throw new AppError('Invalid Status.', StatusCodes.BAD_REQUEST)
    }
    const updatedProposal = await this.proposalRepository.updateProposal(proposal.id, updatedData)
    return updatedProposal
  }

  public async executeAdminRejection(proposalId: number) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)
    const updatedData: Prisma.ProposalUpdateInput = {
      adminReviewedAt: new Date(),
      status: 'REJECTED',
    }
    const updatedProposal = await this.proposalRepository.updateProposal(proposal.id, updatedData)
    return updatedProposal
  }
}

export { ProposalsUseCase }
