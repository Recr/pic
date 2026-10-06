import { StatusCodes } from 'http-status-codes'
import { AppError } from '../errors/AppError'
import { PrismaProposalRepository } from '../repositories/proposal.repository'
import {
  CreateProposalInput,
  CreateProposalWithSuggestions,
  DetailedProposalFilters,
  EmployeeInfo,
  Pagination,
  UpdateProposalNotes,
  UpdateProposalWithChampion,
  UpdateProposalWithManager,
} from '../utils/types/proposals.types'
import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { Prisma, Proposal } from '../../prisma/client/client'
import { PrismaCategoryRepository } from '../repositories/category.repository'
import { PrismaSuggestionRepository } from '../repositories/suggestion.repository'
import { Role } from '../utils/types/employees.types'
import { PrismaProposalAttachmentRepository } from '../repositories/proposal-attachment.repository'
import { PrismaPayoutRepository } from '../repositories/payout.repository'
import fs from 'node:fs/promises'
import path from 'node:path'

class ProposalUseCase {
  constructor(
    private readonly proposalRepository: PrismaProposalRepository,
    private readonly employeeRepository: PrismaEmployeeRepository,
    private readonly categoryRepository: PrismaCategoryRepository,
    private readonly suggestionRepository: PrismaSuggestionRepository,
    private readonly proposalAttachmentRepository: PrismaProposalAttachmentRepository,
    private readonly payoutRepository: PrismaPayoutRepository,
  ) {}

  public async executeFindAll() {
    const proposals = await this.proposalRepository.findAll()
    return proposals
  }

  public async executeFindAllWithEmployees(userId?: number) {
    const where: Prisma.ProposalWhereInput =
      userId === undefined
        ? {
            isActive: true,
            status: {
              in: ['UNDER_VALIDATION', 'TO_IMPLEMENT', 'IMPLEMENTATION'],
            },
          }
        : {
            isActive: true,
            OR: [
              {
                status: {
                  in: ['UNDER_VALIDATION', 'TO_IMPLEMENT', 'IMPLEMENTATION'],
                },
                championId: userId,
              },
              {
                status: 'WAITING_APPROVAL',
                managerId: userId,
              },
            ],
          }
    const proposals = await this.proposalRepository.findAllWithEmployees(where)
    return proposals
  }

  public async executeFindAllDetailed(
    role: Role,
    userId: number,
    pagination: Pagination,
    filters: DetailedProposalFilters = {},
  ) {
    const where: Prisma.ProposalWhereInput =
      role === Role.ADMIN
        ? {}
        : {
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
          }

    if (filters.description) {
      where.description = {
        contains: filters.description,
      }
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.categoryId !== undefined) {
      where.categoryId = filters.categoryId
    }

    if (filters.areaId !== undefined) {
      where.areaId = filters.areaId
    }

    if (role === Role.ADMIN) {
      if (filters.includeInactive === undefined || filters.includeInactive === false) {
        where.isActive = true
      } else if (filters.includeInactive === true) {
        where.OR = [{ isActive: false }, { isActive: true }]
      }
    } else {
      where.isActive = true
    }

    const createdAt: { gte?: Date; lte?: Date } = {}
    if (filters.dateFrom) {
      const d = new Date(filters.dateFrom)
      d.setUTCHours(0, 0, 0, 0)
      createdAt.gte = d
    }
    if (filters.dateTo) {
      const d = new Date(filters.dateTo)
      d.setUTCHours(23, 59, 59, 999)
      createdAt.lte = d
    }
    if (createdAt.gte || createdAt.lte) where.createdAt = createdAt

    const suggestionFilters: Prisma.SuggestionWhereInput[] = []
    const reFilter = filters.re === undefined ? undefined : String(filters.re)
    const idFilter = filters.id === undefined ? undefined : String(filters.id)

    const matcher =
      reFilter || idFilter
        ? (proposal: {
            id: number
            suggestions: {
              employeeRe: number
              employeeId: number | null
              employee?: { id: number | null; re: number | null } | null
            }[]
          }) => {
            const matchesRe =
              !reFilter ||
              proposal.suggestions.some((suggestion) => {
                return (
                  String(suggestion.employeeRe).includes(reFilter) ||
                  String(suggestion.employee?.re ?? '').includes(reFilter)
                )
              })
            const matchesId =
              !idFilter ||
              String(proposal.id).includes(idFilter) ||
              proposal.suggestions.some((suggestion) => {
                return (
                  String(suggestion.employeeId).includes(idFilter) ||
                  String(suggestion.employee?.id ?? '').includes(idFilter)
                )
              })

            return matchesRe && matchesId
          }
        : undefined

    if (filters.employeeName) {
      suggestionFilters.push({
        OR: [
          {
            employeeName: {
              contains: filters.employeeName,
            },
          },
          {
            employee: {
              is: {
                name: {
                  contains: filters.employeeName,
                },
              },
            },
          },
        ],
      })
    }

    if (filters.managerName) {
      where.manager = {
        name: {
          contains: filters.managerName,
        },
      }
    }

    if (filters.championName) {
      where.champion = {
        name: {
          contains: filters.championName,
        },
      }
    }

    if (suggestionFilters.length > 0) {
      where.suggestions = {
        some: {
          AND: suggestionFilters,
        },
      }
    }
    const detailedProposals = await this.proposalRepository.findAllDetailed(
      where,
      matcher ? undefined : pagination,
    )

    if (matcher) {
      const filteredProposals = detailedProposals.proposals.filter(matcher)
      return {
        proposals: filteredProposals.slice(pagination.offset, pagination.offset + pagination.limit),
        totalCount: filteredProposals.length,
      }
    }

    return detailedProposals
  }

  public async executeFindAllWithoutChampion(role: Role, userId: number) {
    const where: Prisma.ProposalWhereInput = {
      isActive: true,
      championId: null,
      status: 'DEFINE_CHAMPION',
      ...(role === Role.ADMIN
        ? {
            OR: [
              {
                managerId: null,
              },
              {
                managerId: userId,
              },
            ],
          }
        : { managerId: userId }),
    }

    return await this.proposalRepository.findAllWithoutChampion(where)
  }

  public async executeFindAllWithoutManagerAndChampion() {
    const where: Prisma.ProposalWhereInput = {
      isActive: true,
      managerId: null,
      championId: null,
      status: 'DEFINE_CHAMPION',
    }
    return await this.proposalRepository.findAllWithoutChampion(where)
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

  public async executeDefineManager(
    proposalId: number,
    data: UpdateProposalWithManager,
    files?: Express.Multer.File[],
  ) {
    const proposal = await this.proposalRepository.findById(Number(proposalId))
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)
    const manager = await this.employeeRepository.findByRe(Number(data.managerRe))
    if (!manager) throw new AppError('Manager not found', StatusCodes.NOT_FOUND)

    const isCustomReward = await this.verifyIsCustomReward(data)
    if (isCustomReward && !data.customRewardAmount && data.isImplemented) {
      throw new AppError(
        'This proposal needs a custom reward value which was not defined.',
        StatusCodes.BAD_REQUEST,
      )
    }

    if ((!files || files.length === 0) && isCustomReward && data.isImplemented === true)
      throw new AppError('Evidence file is required for custom rewards.', StatusCodes.BAD_REQUEST)

    if (files && files.length > 0) {
      await Promise.all(
        files.map((file) => this.proposalAttachmentRepository.create(file, proposal.id)),
      )
    }

    const updatedData: Prisma.ProposalUpdateInput = {
      area: { connect: { id: Number(data.areaId) } },
      category: { connect: { id: Number(data.categoryId) } },
      manager: { connect: { id: manager.id } },
      adminReviewedAt: new Date(),
      isCustomReward: await this.verifyIsCustomReward(data),
      status: Boolean(data.isImplemented) === true ? 'WAITING_APPROVAL' : 'DEFINE_CHAMPION',
      requiresImplementation: Boolean(!data.isImplemented),
      rewardAmount: Number(data.customRewardAmount),
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

      // Reward calculation for approved proposals

      if (!proposal.isCustomReward && proposal.requiresImplementation)
        updatedData.rewardAmount = await this.calculateRewardAmount(proposal)

      if (!proposal.isCustomReward && !customRewardAmount && newStatus === 'TO_IMPLEMENT') {
        const suggestionIdList = await this.getSuggestionIdList(proposal.id)

        const payoutData: Prisma.PayoutCreateManyInput[] = suggestionIdList.map((id) => {
          return {
            status: 'PENDING',
            value: Number(updatedData.rewardAmount) / suggestionIdList.length,
            suggestionId: id,
          }
        })
        const existingPayouts = await this.payoutRepository.findBySuggestionIds(suggestionIdList)

        if (existingPayouts.length === 0) {
          const updatedProposal =
            await this.proposalRepository.updateApprovedProposalAndCreatePayouts(
              proposal.id,
              updatedData,
              payoutData,
            )
          return updatedProposal
        } else {
          const updatedProposal = await this.proposalRepository.updateProposal(
            proposal.id,
            updatedData,
          )
          return updatedProposal
        }
      }

      const updatedProposal = await this.proposalRepository.updateProposal(proposal.id, updatedData)
      return updatedProposal
    } else if (newStatus == 'IMPLEMENTATION') {
      updatedData.implementationStartedAt = new Date()
    } else if (newStatus == 'IMPLEMENTED') {
      updatedData.completedAt = new Date()

      // Reward calculation
      if (proposal.isCustomReward) {
        updatedData.rewardAmount = await this.calculateRewardAmount(proposal, customRewardAmount)

        const suggestionIdList = await this.getSuggestionIdList(proposal.id)

        const payoutData: Prisma.PayoutCreateManyInput[] = suggestionIdList.map((id) => {
          return {
            status: 'PENDING',
            value: Number(updatedData.rewardAmount) / suggestionIdList.length,
            suggestionId: id,
          }
        })

        if (!files || files.length === 0)
          throw new AppError(
            'Evidence file is required for custom rewards.',
            StatusCodes.BAD_REQUEST,
          )

        if (files && files.length > 0) {
          await Promise.all(
            files.map((file) => this.proposalAttachmentRepository.create(file, proposal.id)),
          )
        }

        const completedProposal =
          await this.proposalRepository.updateApprovedProposalAndCreatePayouts(
            proposal.id,
            updatedData,
            payoutData,
          )
        return completedProposal
      } else {
        if (files && files.length > 0) {
          await Promise.all(
            files.map((file) => this.proposalAttachmentRepository.create(file, proposal.id)),
          )
        }

        const completedProposal = await this.proposalRepository.updateProposal(
          proposal.id,
          updatedData,
        )

        return completedProposal
      }
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

  public async executeRestoreProposal(proposalId: number) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (proposal?.isActive) {
      throw new AppError('Proposal is already active.', StatusCodes.BAD_REQUEST)
    }
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)

    const updatedData: Prisma.ProposalUpdateInput = {
      isActive: true,
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

  public async executeUndoImplementedToWaitingApproval(proposalId: number, role: Role) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)

    if (proposal.status !== 'IMPLEMENTED') {
      throw new AppError('Proposal is not in IMPLEMENTED status.', StatusCodes.BAD_REQUEST)
    }

    // Check authorization
    if (role !== Role.ADMIN && role !== Role.MANAGER) {
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
      status: 'WAITING_APPROVAL',
      completedAt: null,
    }

    const updatedProposal = await this.proposalRepository.updateProposal(proposalId, updatedData)
    return updatedProposal
  }

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

  public async executeUndoUnderValidationToDefineChampion(proposalId: number, userId: number) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)

    if (proposal.status !== 'UNDER_VALIDATION') {
      throw new AppError('Proposal is not in UNDER_VALIDATION status.', StatusCodes.BAD_REQUEST)
    }

    if (proposal.championId !== userId && proposal.managerId !== userId) {
      throw new AppError('Unauthorized to undo this proposal.', StatusCodes.FORBIDDEN)
    }

    const updatedData: Prisma.ProposalUpdateInput = {
      status: 'DEFINE_CHAMPION',
      championReviewedAt: null,
      champion: { disconnect: true },
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

  public async executeUpdateProposalManager(proposalId: number, managerRe: number) {
    const manager = await this.employeeRepository.findByRe(managerRe)
    if (!manager) throw new AppError('Manager not found', StatusCodes.NOT_FOUND)

    const updatedProposal = await this.proposalRepository.updateProposal(proposalId, {
      manager: { connect: { id: manager.id } },
    })
    return updatedProposal
  }

  public async executeUpdateProposalChampion(
    proposalId: number,
    userId: number,
    championRe: number,
  ) {
    const champion = await this.employeeRepository.findByRe(championRe)
    if (!champion) throw new AppError('Champion not found', StatusCodes.NOT_FOUND)

    // Check authorization: manager of the proposal or admin
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found', StatusCodes.NOT_FOUND)

    const user = await this.employeeRepository.findById(userId)
    if (!user) throw new AppError('User not found', StatusCodes.NOT_FOUND)

    if (user.role !== Role.ADMIN) {
      if (proposal.managerId !== userId) {
        throw new AppError('Unauthorized to update this proposal.', StatusCodes.FORBIDDEN)
      }
    }

    const updatedProposal = await this.proposalRepository.updateProposal(proposalId, {
      champion: { connect: { id: champion.id } },
    })
    return updatedProposal
  }

  public async executeImplementedProposalManagerReview(
    proposalId: number,
    newStatus: string,
    rejectionNote?: string,
  ) {
    const proposal = await this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError('Proposal not found.', StatusCodes.NOT_FOUND)
    if (proposal.status !== 'WAITING_APPROVAL') {
      throw new AppError('Proposal is not in WAITING_APPROVAL status.', StatusCodes.BAD_REQUEST)
    }

    let updatedData: Prisma.ProposalUpdateInput = {}

    if (newStatus === 'REJECTED') {
      if (!rejectionNote || rejectionNote.trim() === '') {
        throw new AppError(
          'Rejection note is required when rejecting a proposal.',
          StatusCodes.BAD_REQUEST,
        )
      }

      updatedData = {
        status: 'DEFINE_CHAMPION',
        rejectionNote: rejectionNote.trim(),
        managerReviewedAt: new Date(),
        manager: { disconnect: true },
      }

      const updatedProposal = await this.proposalRepository.updateProposal(proposalId, updatedData)
      return updatedProposal
    } else if (newStatus === 'IMPLEMENTED') {
      const suggestionIdList = await this.getSuggestionIdList(proposalId)

      updatedData = {
        status: newStatus,
        completedAt: new Date(),
        managerReviewedAt: new Date(),
        rewardAmount: await this.calculateRewardAmount(proposal),
      }

      const payoutData: Prisma.PayoutCreateManyInput[] = suggestionIdList.map((id) => ({
        status: 'PENDING',
        value: Number(updatedData.rewardAmount) / suggestionIdList.length,
        suggestionId: id,
      }))

      const existingPayouts = await this.payoutRepository.findBySuggestionIds(suggestionIdList)

      if (existingPayouts.length !== 0) {
        throw new AppError(
          'Payouts already exist for this proposal. Cannot create duplicate payouts.',
          StatusCodes.BAD_REQUEST,
        )
      }

      const updatedProposal = await this.proposalRepository.updateApprovedProposalAndCreatePayouts(
        proposalId,
        updatedData,
        payoutData,
      )
      return updatedProposal
    } else {
      throw new AppError('Invalid status.', StatusCodes.BAD_REQUEST)
    }
  }

  // Helper methods

  private async verifyIsCustomReward(data: UpdateProposalWithChampion | UpdateProposalWithManager) {
    if (data.isCustomReward) return true

    const category = await this.categoryRepository.findById(Number(data.categoryId))
    if (!category) throw new AppError('Category not found.', StatusCodes.NOT_FOUND)
    return (
      category.categoryReward == null ||
      category.categoryReward === undefined ||
      Number(category.categoryReward) === 0.0
    )
  }

  private async ensureCanManageAttachments(proposalId: number, userId: number, role: Role) {
    const proposal = await this.proposalRepository.findById(Number(proposalId))
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

  private async calculateRewardAmount(
    proposal: Proposal,
    customRewardAmount?: number,
  ): Promise<number> {
    if (!proposal.categoryId) {
      throw new AppError('Category not defined.', StatusCodes.BAD_REQUEST)
    }

    const category = await this.categoryRepository.findById(proposal.categoryId)
    if (!category) {
      throw new AppError('Category not found.', StatusCodes.NOT_FOUND)
    }

    if (
      proposal.isCustomReward ||
      category.categoryReward == null ||
      Number(category.categoryReward) === 0.0
    ) {
      if (proposal.rewardAmount !== null && proposal.rewardAmount !== undefined) {
        return Number(proposal.rewardAmount)
      }
      if (customRewardAmount !== null && customRewardAmount !== undefined) {
        return Number(customRewardAmount)
      } else {
        throw new AppError('Custom reward amount not defined.', StatusCodes.BAD_REQUEST)
      }
    } else {
      return Number(category.categoryReward)
    }
  }

  private async getSuggestionIdList(proposalId: number): Promise<number[]> {
    const suggestionIdList = (await this.suggestionRepository.findByProposalId(proposalId)).map(
      (suggestion) => {
        return suggestion.id
      },
    )

    if (suggestionIdList.length === 0)
      throw new AppError('Proposal has no suggestions.', StatusCodes.BAD_REQUEST)

    return suggestionIdList
  }
}

export { ProposalUseCase }
