import { StatusCodes } from 'http-status-codes'
import { AppError } from '../errors/AppError'
import { PrismaProposalRepository } from '../repositories/proposal.repository'
import {
  CreateProposalInput,
  CreateProposalWithSuggestions,
  EmployeeInfo,
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

  public async executeFindAllWithEmployees(userId?: number) {
    const proposals = await this.proposalRepository.findAllWithEmployees(userId)
    return proposals
  }

  public async executeFindAllWithoutChampion() {
    const proposals = await this.proposalRepository.findAllWithoutChampion()
    return proposals
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
    console.log(employees)
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

  public async executeChampionReview(proposalId: number, newStatus: string) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)
    const updatedStatus: Prisma.ProposalUpdateInput = { status: newStatus }
    if (newStatus == 'TO_IMPLEMENT' || newStatus == 'NOT_VIABLE' || newStatus == 'REJECTED') {
      updatedStatus.championReviewedAt = new Date()
    } else if (newStatus == 'IMPLEMENTATION') {
      updatedStatus.implementationStartedAt = new Date()
    } else if (newStatus == 'IMPLEMENTED') {
      updatedStatus.completedAt = new Date()
    } else {
      throw new AppError('Invalid Status.', StatusCodes.BAD_REQUEST)
    }
    const updatedProposal = await this.proposalRepository.updateProposal(proposal.id, updatedStatus)
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
