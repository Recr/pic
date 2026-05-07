import { StatusCodes } from 'http-status-codes'
import { AppError } from '../errors/AppError'
import { PrismaProposalRepository } from '../repositories/proposal.repository'
import {
  CreateProposalInput,
  CreateProposalWithSuggestions,
  EmployeeInfo,
  UpdateProposalNotes,
  UpdateProposalWithChampion,
  UpdateProposalWithManager,
} from '../utils/types/proposals.types'
import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { Prisma } from '../../prisma/client/client'
import { PrismaCategoryRepository } from '../repositories/category.repository'
import { PrismaSuggestionRepository } from '../repositories/suggestion.repository'
import { Role } from '../utils/types/employees.types'
import { PrismaProposalAttachmentRepository } from '../repositories/proposal-attachment.repository'
import { PrismaPayoutRepository } from '../repositories/payout.repository'
import fs from 'node:fs/promises'
import path from 'node:path'

class ProposalsUseCase {
  constructor(
    private proposalRepository: PrismaProposalRepository,
    private employeeRepository: PrismaEmployeeRepository,
    private categoryRepository: PrismaCategoryRepository,
    private suggestionRepository: PrismaSuggestionRepository,
    private proposalAttachmentRepository: PrismaProposalAttachmentRepository,
    private payoutRepository?: PrismaPayoutRepository,
  ) {}

  public async executeFindAll() {
    const proposals = await this.proposalRepository.findAll()
    return proposals
  }

  public async executeFindAllWithEmployees(userId?: number) {
    const proposals = await this.proposalRepository.findAllWithEmployees(userId)
    return proposals
  }

  public async executeFindAllDetailed(role: Role, userId: number) {
    if (role === Role.ADMIN) {
      return await this.proposalRepository.findAllDetailed()
    }

    const proposals = await this.proposalRepository.findAllDetailed({
      OR: [
        {
          suggestions: {
            some: {
              employeeId: userId,
            },
          },
        },
        { managerId: userId },
        { championId: userId },
      ],
    })
    return proposals
  }

  public async executeFindAllWithoutChampion(role: Role, userId: number) {
    if (role === Role.ADMIN) {
      return await this.proposalRepository.findAllWithoutChampion(userId)
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

  public async executeFindByCategoryId(categoryId: number) {
    const proposals = await this.proposalRepository.findByCategoryId(categoryId)
    return proposals
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
      managerNotes: data.managerNotes?.trim() || null,
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
      isCustomReward: await this.verifyIsCustomReward(data),
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
      isCustomReward: await this.verifyIsCustomReward(data),
    }
    const updatedProposal = await this.proposalRepository.updateProposal(proposal.id, updatedData)
    return updatedProposal
  }

  public async executeChampionReview(
    proposalId: number,
    newStatus: string,
    customRewardAmount?: number,
    rejectionNote?: string,
    files?: Express.Multer.File[],
  ) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)
    const updatedData: Prisma.ProposalUpdateInput = { status: newStatus }

    if (newStatus == 'TO_IMPLEMENT' || newStatus == 'NOT_VIABLE' || newStatus == 'REJECTED') {
      updatedData.championReviewedAt = new Date()

      if (newStatus === 'REJECTED' || newStatus === 'NOT_VIABLE') {
        const normalizedRejectionNote = rejectionNote?.trim()
        if (!normalizedRejectionNote) {
          throw new AppError(
            'Rejection note is required for rejected or not viable proposals.',
            StatusCodes.BAD_REQUEST,
          )
        }
        updatedData.rejectionNote = normalizedRejectionNote
      }
    } else if (newStatus == 'IMPLEMENTATION') {
      updatedData.implementationStartedAt = new Date()
    } else if (newStatus == 'IMPLEMENTED') {
      updatedData.completedAt = new Date()

      // Reward calculation

      if (proposal.isCustomReward) {
        if (!customRewardAmount || customRewardAmount <= 0)
          throw new AppError('Invalid or missing custom reward amount.', StatusCodes.BAD_REQUEST)
        updatedData.rewardAmount = customRewardAmount
      } else {
        if (!proposal.categoryId)
          throw new AppError('Category not defined.', StatusCodes.BAD_REQUEST)
        const category = await this.categoryRepository.findById(proposal.categoryId)
        if (category?.categoryReward == null)
          throw new AppError('Category reward not defined.', StatusCodes.BAD_REQUEST)
        updatedData.rewardAmount = category?.categoryReward
      }

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
          value: Number(updatedData.rewardAmount) / suggestionIdList.length,
          suggestionId: id,
        }
      })

      if (proposal.isCustomReward && (!files || files.length === 0))
        throw new AppError('Evidence file is required for custom rewards.', StatusCodes.BAD_REQUEST)

      if (files && files.length > 0) {
        await Promise.all(
          files.map((file) => this.proposalAttachmentRepository.create(file, proposal.id)),
        )
      }

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

  public async executeUpdateChampionNotes(
    proposalId: number,
    data: UpdateProposalNotes,
    userId: number,
  ) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)

    if (proposal.championId !== userId) {
      throw new AppError('Unauthorized to update notes for this proposal.', StatusCodes.FORBIDDEN)
    }

    const updatedData: Prisma.ProposalUpdateInput = {
      notes: data.notes?.trim() || null,
    }

    const updatedProposal = await this.proposalRepository.updateProposal(proposal.id, updatedData)
    return updatedProposal
  }

  public async executeAdminRejection(proposalId: number, rejectionNote: string) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)
    const updatedData: Prisma.ProposalUpdateInput = {
      adminReviewedAt: new Date(),
      status: 'REJECTED',
      rejectionNote: rejectionNote.trim(),
    }
    const updatedProposal = await this.proposalRepository.updateProposal(proposal.id, updatedData)
    return updatedProposal
  }

  public async executeRejectProposal(proposalId: number, userId: number, rejectionNote: string) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)

    if (proposal.managerId !== userId) {
      throw new AppError('Unauthorized to reject this proposal.', StatusCodes.FORBIDDEN)
    }

    const updatedData: Prisma.ProposalUpdateInput = {
      adminReviewedAt: new Date(),
      status: 'REJECTED',
      rejectionNote: rejectionNote.trim(),
    }

    const updatedProposal = await this.proposalRepository.updateProposal(proposal.id, updatedData)
    return updatedProposal
  }

  public async executeSoftDeleteProposal(proposalId: number) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)

    const updatedData: Prisma.ProposalUpdateInput = {
      isActive: false,
    }

    const updatedProposal = await this.proposalRepository.updateProposal(proposal.id, updatedData)
    return updatedProposal
  }

  public async executeGetAttachment(proposalId: number, attachmentId: number) {
    const attachment = await this.proposalAttachmentRepository.findById(attachmentId)
    if (!attachment || attachment.proposalId !== proposalId) {
      throw new AppError('Attachment not found or access denied.', StatusCodes.NOT_FOUND)
    }
    return attachment
  }

  public async executeAddAttachments(
    proposalId: number,
    userId: number,
    role: Role,
    files?: Express.Multer.File[],
  ) {
    await this.ensureCanManageAttachments(proposalId, userId, role)

    if (!files || files.length === 0) {
      throw new AppError('No files were provided.', StatusCodes.BAD_REQUEST)
    }

    return await Promise.all(
      files.map((file) => this.proposalAttachmentRepository.create(file, proposalId)),
    )
  }

  public async executeDeleteAttachment(
    proposalId: number,
    attachmentId: number,
    userId: number,
    role: Role,
  ) {
    await this.ensureCanManageAttachments(proposalId, userId, role)

    const attachment = await this.executeGetAttachment(proposalId, attachmentId)
    const uploadDir = path.resolve(process.cwd(), 'uploads', 'proposal-attachments')
    const filePath = path.resolve(uploadDir, attachment.relativePath)

    try {
      await fs.unlink(filePath)
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code !== 'ENOENT') {
        throw new AppError(
          'Failed to remove attachment file from disk.',
          StatusCodes.INTERNAL_SERVER_ERROR,
        )
      }
    }

    await this.proposalAttachmentRepository.deleteById(attachmentId)
  }

  // Undo status methods

  public async executeUndoImplementedToImplementation(
    proposalId: number,
    userId: number,
    role: Role,
  ) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)

    if (proposal.status !== 'IMPLEMENTED') {
      throw new AppError('Proposal is not in IMPLEMENTED status.', StatusCodes.BAD_REQUEST)
    }

    // Check authorization
    if (role !== Role.ADMIN && proposal.championId !== userId) {
      throw new AppError('Unauthorized to undo this proposal.', StatusCodes.FORBIDDEN)
    }

    // Check if proposal was completed more than 1 week ago
    if (proposal.completedAt) {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      if (proposal.completedAt < oneWeekAgo) {
        throw new AppError(
          'Cannot undo a proposal that was implemented more than 1 week ago.',
          StatusCodes.BAD_REQUEST,
        )
      }
    }

    // Delete payouts
    if (this.payoutRepository) {
      await this.payoutRepository.deleteByProposalId(proposalId)
    }

    const updatedData: Prisma.ProposalUpdateInput = {
      status: 'IMPLEMENTATION',
      completedAt: null,
    }

    const updatedProposal = await this.proposalRepository.updateProposal(proposalId, updatedData)
    return updatedProposal
  }

  public async executeUndoImplementationToToImplement(proposalId: number, userId: number) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)

    if (proposal.status !== 'IMPLEMENTATION') {
      throw new AppError('Proposal is not in IMPLEMENTATION status.', StatusCodes.BAD_REQUEST)
    }

    if (proposal.championId !== userId) {
      throw new AppError('Unauthorized to undo this proposal.', StatusCodes.FORBIDDEN)
    }

    const updatedData: Prisma.ProposalUpdateInput = {
      status: 'TO_IMPLEMENT',
      implementationStartedAt: null,
    }

    const updatedProposal = await this.proposalRepository.updateProposal(proposalId, updatedData)
    return updatedProposal
  }

  public async executeUndoToImplementToUnderValidation(proposalId: number, userId: number) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)

    if (proposal.status !== 'TO_IMPLEMENT') {
      throw new AppError('Proposal is not in TO_IMPLEMENT status.', StatusCodes.BAD_REQUEST)
    }

    if (proposal.championId !== userId) {
      throw new AppError('Unauthorized to undo this proposal.', StatusCodes.FORBIDDEN)
    }

    const updatedData: Prisma.ProposalUpdateInput = {
      status: 'UNDER_VALIDATION',
      championReviewedAt: null,
    }

    const updatedProposal = await this.proposalRepository.updateProposal(proposalId, updatedData)
    return updatedProposal
  }

  public async executeUndoRejectedToUnderValidation(proposalId: number, userId: number) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)

    if (proposal.status !== 'REJECTED' && proposal.status !== 'NOT_VIABLE') {
      throw new AppError(
        'Proposal is not in REJECTED or NOT_VIABLE status.',
        StatusCodes.BAD_REQUEST,
      )
    }

    if (proposal.championId !== userId) {
      throw new AppError('Unauthorized to undo this proposal.', StatusCodes.FORBIDDEN)
    }

    const updatedData: Prisma.ProposalUpdateInput = {
      status: 'UNDER_VALIDATION',
      rejectionNote: null,
    }

    const updatedProposal = await this.proposalRepository.updateProposal(proposalId, updatedData)
    return updatedProposal
  }

  public async executeUndoRejectedToDefineChampion(proposalId: number, userId: number, role: Role) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)

    if (proposal.status !== 'REJECTED') {
      throw new AppError('Proposal is not in REJECTED status.', StatusCodes.BAD_REQUEST)
    }

    // Check authorization: manager of the proposal or admin
    if (role !== Role.ADMIN && proposal.managerId !== userId) {
      throw new AppError('Unauthorized to undo this proposal.', StatusCodes.FORBIDDEN)
    }

    // Check if there's no champion
    if (proposal.championId !== null) {
      throw new AppError(
        'Cannot undo to DEFINE_CHAMPION if a champion is already assigned.',
        StatusCodes.BAD_REQUEST,
      )
    }

    const updatedData: Prisma.ProposalUpdateInput = {
      status: 'DEFINE_CHAMPION',
      rejectionNote: null,
    }

    const updatedProposal = await this.proposalRepository.updateProposal(proposalId, updatedData)
    return updatedProposal
  }

  // Helper methods

  private async verifyIsCustomReward(data: UpdateProposalWithChampion | UpdateProposalWithManager) {
    if (data.isCustomReward) return true

    const category = await this.categoryRepository.findById(data.categoryId)
    if (!category) throw new AppError('Category not found.', StatusCodes.NOT_FOUND)
    return (
      category.categoryReward == null ||
      category.categoryReward === undefined ||
      Number(category.categoryReward) === 0.0
    )
  }

  private async ensureCanManageAttachments(proposalId: number, userId: number, role: Role) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) {
      throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)
    }

    if (role === Role.ADMIN) {
      return
    }

    const isManager = proposal.managerId === userId
    const isChampion = proposal.championId === userId

    if (isManager || isChampion) {
      return
    }

    throw new AppError(
      'Unauthorized to manage attachments for this proposal. Only manager, champion, or admin can edit attachments.',
      StatusCodes.FORBIDDEN,
    )
  }
}

export { ProposalsUseCase }
