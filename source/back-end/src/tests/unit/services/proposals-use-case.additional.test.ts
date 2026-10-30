import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StatusCodes } from 'http-status-codes'
import fs from 'node:fs/promises'
import { ProposalUseCase } from '../../../services/proposals.use-case'
import { Role } from '../../../utils/types/employees.types'
import { AppError } from '../../../errors/AppError'

vi.mock('node:fs/promises', () => ({ default: { unlink: vi.fn() } }))

type MockRepository = Record<string, ReturnType<typeof vi.fn>>

const makeRepository = (...methods: string[]): MockRepository =>
  Object.fromEntries(methods.map((method) => [method, vi.fn()]))

const makeProposal = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 1,
    categoryId: 10,
    managerId: 2,
    championId: 3,
    status: 'DEFINE_CHAMPION',
    isActive: true,
    isCustomReward: false,
    requiresImplementation: false,
    rewardAmount: 100,
    completedAt: null,
    ...overrides,
  }) as never

describe('ProposalUseCase remaining operations', () => {
  let proposalRepository: MockRepository
  let employeeRepository: MockRepository
  let categoryRepository: MockRepository
  let suggestionRepository: MockRepository
  let attachmentRepository: MockRepository
  let payoutRepository: MockRepository
  let useCase: ProposalUseCase

  beforeEach(() => {
    proposalRepository = makeRepository(
      'findById',
      'updateProposal',
      'updateApprovedProposalAndCreatePayouts',
    )
    employeeRepository = makeRepository('findByRe', 'findById')
    categoryRepository = makeRepository('findById')
    suggestionRepository = makeRepository('findByProposalId')
    attachmentRepository = makeRepository('findById', 'create', 'deleteById')
    payoutRepository = makeRepository('findBySuggestionIds', 'deleteByProposalId')
    useCase = new ProposalUseCase(
      proposalRepository as never,
      employeeRepository as never,
      categoryRepository as never,
      suggestionRepository as never,
      attachmentRepository as never,
      payoutRepository as never,
    )
  })

  it('defines a champion and normalizes manager notes', async () => {
    proposalRepository.findById.mockResolvedValue(makeProposal({ managerId: 2 }))
    employeeRepository.findByRe.mockResolvedValue({ id: 8 })
    proposalRepository.updateProposal.mockResolvedValue('updated')

    await expect(
      useCase.executeDefineChampion(1, { championRe: 80, managerNotes: ' notes ' }, 2),
    ).resolves.toBe('updated')
    expect(proposalRepository.updateProposal).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        champion: { connect: { id: 8 } },
        status: 'UNDER_VALIDATION',
        managerNotes: 'notes',
      }),
    )
  })

  it('rejects unauthorized or unknown champion definitions', async () => {
    proposalRepository.findById.mockResolvedValue(makeProposal({ managerId: 9 }))
    await expect(useCase.executeDefineChampion(1, { championRe: 80 }, 2)).rejects.toMatchObject({
      statusCode: StatusCodes.FORBIDDEN,
    })
    proposalRepository.findById.mockResolvedValue(makeProposal({ managerId: 2 }))
    employeeRepository.findByRe.mockResolvedValue(undefined)
    await expect(useCase.executeDefineChampion(1, { championRe: 80 }, 2)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND,
    })
  })

  it('defines a champion administratively and determines custom reward', async () => {
    proposalRepository.findById.mockResolvedValue(makeProposal())
    employeeRepository.findByRe.mockResolvedValue({ id: 8 })
    categoryRepository.findById.mockResolvedValue({ categoryReward: 0 })
    proposalRepository.updateProposal.mockResolvedValue('updated')

    await expect(
      useCase.executeAdminDefineChampion(1, {
        championRe: 80,
        areaId: 4,
        categoryId: 5,
        isCustomReward: false,
      }),
    ).resolves.toBe('updated')
    expect(proposalRepository.updateProposal).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ isCustomReward: true }),
    )
  })

  it('defines a manager, uploads evidence, and updates implementation state', async () => {
    proposalRepository.findById.mockResolvedValue(makeProposal())
    employeeRepository.findByRe.mockResolvedValue({ id: 7 })
    categoryRepository.findById.mockResolvedValue({ categoryReward: 20 })
    proposalRepository.updateProposal.mockResolvedValue('updated')
    const files = [{ originalname: 'evidence' }] as never

    await expect(
      useCase.executeDefineManager(
        1,
        { managerRe: 70, areaId: 4, categoryId: 5, isCustomReward: false, isImplemented: true },
        files,
      ),
    ).resolves.toBe('updated')
    expect(attachmentRepository.create).toHaveBeenCalledWith(files[0], 1)
    expect(proposalRepository.updateProposal).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ status: 'WAITING_APPROVAL', requiresImplementation: false }),
    )
  })

  it('validates custom reward manager definition', async () => {
    proposalRepository.findById.mockResolvedValue(makeProposal())
    employeeRepository.findByRe.mockResolvedValue({ id: 7 })
    await expect(
      useCase.executeDefineManager(1, {
        managerRe: 70,
        areaId: 4,
        categoryId: 5,
        isCustomReward: true,
        isImplemented: true,
      }),
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
  })

  it('reviews champion approval, rejection, implementation, and custom completion', async () => {
    proposalRepository.findById.mockResolvedValue(
      makeProposal({ requiresImplementation: true, rewardAmount: 100 }),
    )
    categoryRepository.findById.mockResolvedValue({ categoryReward: 25 })
    suggestionRepository.findByProposalId.mockResolvedValue([{ id: 11 }, { id: 12 }])
    payoutRepository.findBySuggestionIds.mockResolvedValue([])
    proposalRepository.updateApprovedProposalAndCreatePayouts.mockResolvedValue('approved')
    await expect(useCase.executeChampionReview(1, 'TO_IMPLEMENT')).resolves.toBe('approved')

    proposalRepository.findById.mockResolvedValue(makeProposal())
    proposalRepository.updateProposal.mockResolvedValue('rejected')
    await expect(useCase.executeChampionReview(1, 'REJECTED', undefined, ' no ')).resolves.toBe(
      'rejected',
    )

    await expect(useCase.executeChampionReview(1, 'IMPLEMENTATION')).resolves.toBe('rejected')
    await expect(useCase.executeChampionReview(1, 'INVALID')).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST,
    })

    proposalRepository.findById.mockResolvedValue(makeProposal({ isCustomReward: true }))
    suggestionRepository.findByProposalId.mockResolvedValue([{ id: 11 }])
    proposalRepository.updateApprovedProposalAndCreatePayouts.mockResolvedValue('completed')
    await expect(
      useCase.executeChampionReview(1, 'IMPLEMENTED', 50, undefined, [{}] as never),
    ).resolves.toBe('completed')
  })

  it('uses a supplied custom reward and rejects proposals without suggestions', async () => {
    proposalRepository.findById.mockResolvedValue(
      makeProposal({ isCustomReward: true, rewardAmount: null }),
    )
    categoryRepository.findById.mockResolvedValue({ categoryReward: 0 })
    suggestionRepository.findByProposalId.mockResolvedValue([])

    await expect(
      useCase.executeChampionReview(1, 'IMPLEMENTED', 50, undefined, [{}] as never),
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
    expect(suggestionRepository.findByProposalId).toHaveBeenCalledWith(1)
  })

  it('reports invalid reward configuration', async () => {
    proposalRepository.findById.mockResolvedValue(
      makeProposal({ requiresImplementation: true, categoryId: null }),
    )
    await expect(useCase.executeChampionReview(1, 'TO_IMPLEMENT')).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST,
    })

    proposalRepository.findById.mockResolvedValue(makeProposal({ requiresImplementation: true }))
    categoryRepository.findById.mockResolvedValue(undefined)
    await expect(useCase.executeChampionReview(1, 'TO_IMPLEMENT')).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND,
    })

    proposalRepository.findById.mockResolvedValue(
      makeProposal({ isCustomReward: true, rewardAmount: null }),
    )
    categoryRepository.findById.mockResolvedValue({ categoryReward: 0 })
    await expect(
      useCase.executeChampionReview(1, 'IMPLEMENTED', undefined, undefined, [{}] as never),
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
  })

  it('completes a standard reward implementation and validates note ownership', async () => {
    proposalRepository.findById.mockResolvedValue(makeProposal({ isCustomReward: false }))
    proposalRepository.updateProposal.mockResolvedValue('completed')
    await expect(
      useCase.executeChampionReview(1, 'IMPLEMENTED', undefined, undefined, [{}] as never),
    ).resolves.toBe('completed')

    await expect(
      useCase.executeUpdateChampionNotes(1, { notes: 'note' }, 99),
    ).rejects.toMatchObject({ statusCode: StatusCodes.FORBIDDEN })
    await expect(useCase.executeRejectProposal(1, 99, 'reason')).rejects.toMatchObject({
      statusCode: StatusCodes.FORBIDDEN,
    })
  })

  it('validates champion rejection notes, duplicate payouts, and custom evidence', async () => {
    proposalRepository.findById.mockResolvedValue(makeProposal())
    await expect(useCase.executeChampionReview(1, 'REJECTED')).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST,
    })

    proposalRepository.findById.mockResolvedValue(makeProposal({ requiresImplementation: true }))
    categoryRepository.findById.mockResolvedValue({ categoryReward: 25 })
    suggestionRepository.findByProposalId.mockResolvedValue([{ id: 11 }])
    payoutRepository.findBySuggestionIds.mockResolvedValue([{ id: 99 }])
    await expect(useCase.executeChampionReview(1, 'TO_IMPLEMENT')).resolves.toBeUndefined()
    expect(proposalRepository.updateProposal).toHaveBeenCalled()

    proposalRepository.findById.mockResolvedValue(makeProposal({ isCustomReward: true }))
    suggestionRepository.findByProposalId.mockResolvedValue([{ id: 11 }])
    await expect(useCase.executeChampionReview(1, 'IMPLEMENTED')).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST,
    })

    proposalRepository.findById.mockResolvedValue(makeProposal())
    employeeRepository.findByRe.mockResolvedValue({ id: 7 })
    await expect(
      useCase.executeDefineManager(1, {
        managerRe: 70,
        areaId: 4,
        categoryId: 5,
        isCustomReward: true,
        isImplemented: true,
        customRewardAmount: 50,
      }),
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
  })

  it('updates notes, rejects, soft deletes, and restores proposals', async () => {
    proposalRepository.findById.mockResolvedValue(makeProposal())
    proposalRepository.updateProposal.mockResolvedValue('updated')
    await expect(useCase.executeUpdateChampionNotes(1, { notes: ' notes ' }, 3)).resolves.toBe(
      'updated',
    )
    await expect(useCase.executeAdminRejection(1, ' rejected ')).resolves.toBe('updated')
    await expect(useCase.executeRejectProposal(1, 2, ' rejected ')).resolves.toBe('updated')
    await expect(useCase.executeSoftDeleteProposal(1)).resolves.toBe('updated')

    proposalRepository.findById.mockResolvedValue(makeProposal({ isActive: false }))
    await expect(useCase.executeRestoreProposal(1)).resolves.toBe('updated')
    proposalRepository.findById.mockResolvedValue(makeProposal({ isActive: true }))
    await expect(useCase.executeRestoreProposal(1)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST,
    })
  })

  it('gets, adds, and deletes attachments with authorization', async () => {
    const attachment = { proposalId: 1, relativePath: 'file.txt' }
    attachmentRepository.findById.mockResolvedValue(attachment)
    proposalRepository.findById.mockResolvedValue(makeProposal({ managerId: 2 }))
    await expect(useCase.executeGetAttachment(1, 4)).resolves.toBe(attachment)
    attachmentRepository.findById.mockResolvedValue(undefined)
    await expect(useCase.executeGetAttachment(1, 4)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND,
    })
    attachmentRepository.findById.mockResolvedValue({ ...attachment, proposalId: 2 })
    await expect(useCase.executeGetAttachment(1, 4)).rejects.toMatchObject({
      statusCode: StatusCodes.NOT_FOUND,
    })
    attachmentRepository.findById.mockResolvedValue(attachment)
    await expect(useCase.executeAddAttachments(1, 2, Role.MANAGER, [{}] as never)).resolves.toEqual(
      [undefined],
    )
    await expect(useCase.executeAddAttachments(1, 2, Role.MANAGER)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST,
    })
    await expect(useCase.executeDeleteAttachment(1, 4, 2, Role.MANAGER)).resolves.toBeUndefined()
    expect(attachmentRepository.deleteById).toHaveBeenCalledWith(4)
    vi.mocked(fs.unlink).mockRejectedValueOnce({ code: 'EACCES' })
    await expect(useCase.executeDeleteAttachment(1, 4, 2, Role.MANAGER)).rejects.toMatchObject({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    })
  })

  it('allows admins and champions to manage attachments and rejects unrelated users', async () => {
    proposalRepository.findById.mockResolvedValue(makeProposal({ managerId: 2, championId: 3 }))
    attachmentRepository.create.mockResolvedValue('created')

    await expect(useCase.executeAddAttachments(1, 99, Role.ADMIN, [{}] as never)).resolves.toEqual([
      'created',
    ])
    await expect(
      useCase.executeAddAttachments(1, 3, Role.OPERATOR, [{}] as never),
    ).resolves.toEqual(['created'])
    await expect(
      useCase.executeAddAttachments(1, 99, Role.OPERATOR, [{}] as never),
    ).rejects.toMatchObject({ statusCode: StatusCodes.FORBIDDEN })
    proposalRepository.findById.mockResolvedValue(undefined)
    await expect(
      useCase.executeAddAttachments(1, 2, Role.ADMIN, [{}] as never),
    ).rejects.toMatchObject({ statusCode: StatusCodes.NOT_FOUND })
  })

  it('executes all undo transitions', async () => {
    proposalRepository.updateProposal.mockResolvedValue('updated')
    const cases: [string, (...args: never[]) => Promise<unknown>, unknown[]][] = [
      [
        'IMPLEMENTED',
        useCase.executeUndoImplementedToWaitingApproval.bind(useCase),
        [1, Role.ADMIN],
      ],
      [
        'IMPLEMENTED',
        useCase.executeUndoImplementedToImplementation.bind(useCase),
        [1, 3, Role.ADMIN],
      ],
      ['IMPLEMENTATION', useCase.executeUndoImplementationToToImplement.bind(useCase), [1, 3]],
      ['TO_IMPLEMENT', useCase.executeUndoToImplementToUnderValidation.bind(useCase), [1, 3]],
      [
        'UNDER_VALIDATION',
        useCase.executeUndoUnderValidationToDefineChampion.bind(useCase),
        [1, 3],
      ],
      [
        'DEFINE_CHAMPION',
        useCase.executeUndoManagerDefineChampionToAdminDefineManager.bind(useCase),
        [1, 2],
      ],
      ['REJECTED', useCase.executeUndoRejectedToUnderValidation.bind(useCase), [1, 3]],
      ['REJECTED', useCase.executeUndoRejectedToDefineChampion.bind(useCase), [1, 2, Role.ADMIN]],
    ]

    for (const [status, operation, args] of cases) {
      proposalRepository.findById.mockResolvedValue(
        makeProposal({ status, championId: status === 'REJECTED' && args.length > 2 ? null : 3 }),
      )
      await expect(operation(...(args as never[]))).resolves.toBe('updated')
    }
    expect(payoutRepository.deleteByProposalId).toHaveBeenCalledTimes(2)
  })

  it('updates manager and champion assignments', async () => {
    employeeRepository.findByRe.mockResolvedValue({ id: 9 })
    proposalRepository.updateProposal.mockResolvedValue('updated')
    await expect(useCase.executeUpdateProposalManager(1, 90)).resolves.toBe('updated')

    proposalRepository.findById.mockResolvedValue(makeProposal({ managerId: 2 }))
    employeeRepository.findById.mockResolvedValue({ role: Role.ADMIN })
    await expect(useCase.executeUpdateProposalChampion(1, 2, 80)).resolves.toBe('updated')
  })

  it('rejects unauthorized champion reassignment and rejected-proposal undo', async () => {
    proposalRepository.findById.mockResolvedValue(
      makeProposal({ status: 'REJECTED', championId: 3 }),
    )
    await expect(
      useCase.executeUndoRejectedToDefineChampion(1, 99, Role.OPERATOR),
    ).rejects.toMatchObject({ statusCode: StatusCodes.FORBIDDEN })
    await expect(
      useCase.executeUndoRejectedToDefineChampion(1, 2, Role.MANAGER),
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })

    employeeRepository.findByRe.mockResolvedValue({ id: 8 })
    employeeRepository.findById.mockResolvedValue({ role: Role.OPERATOR })
    proposalRepository.findById.mockResolvedValue(makeProposal({ managerId: 2 }))
    await expect(useCase.executeUpdateProposalChampion(1, 99, 80)).rejects.toMatchObject({
      statusCode: StatusCodes.FORBIDDEN,
    })

    proposalRepository.findById.mockResolvedValue(makeProposal({ status: 'DEFINE_CHAMPION' }))
    await expect(useCase.executeUndoRejectedToUnderValidation(1, 3)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST,
    })
    proposalRepository.findById.mockResolvedValue(
      makeProposal({ status: 'REJECTED', championId: 3 }),
    )
    await expect(useCase.executeUndoRejectedToUnderValidation(1, 99)).rejects.toMatchObject({
      statusCode: StatusCodes.FORBIDDEN,
    })
    proposalRepository.findById.mockResolvedValue(makeProposal({ status: 'NOT_VIABLE' }))
    await expect(
      useCase.executeUndoRejectedToDefineChampion(1, 2, Role.ADMIN),
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })

    proposalRepository.findById.mockResolvedValue(makeProposal({ status: 'REJECTED' }))
    await expect(useCase.executeUndoUnderValidationToDefineChampion(1, 3)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST,
    })
    proposalRepository.findById.mockResolvedValue(
      makeProposal({ status: 'UNDER_VALIDATION', championId: 3, managerId: 2 }),
    )
    await expect(useCase.executeUndoUnderValidationToDefineChampion(1, 99)).rejects.toMatchObject({
      statusCode: StatusCodes.FORBIDDEN,
    })
    proposalRepository.findById.mockResolvedValue(makeProposal({ status: 'REJECTED' }))
    await expect(
      useCase.executeUndoManagerDefineChampionToAdminDefineManager(1, 2),
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
    proposalRepository.findById.mockResolvedValue(
      makeProposal({ status: 'DEFINE_CHAMPION', managerId: 2 }),
    )
    await expect(
      useCase.executeUndoManagerDefineChampionToAdminDefineManager(1, 99),
    ).rejects.toMatchObject({ statusCode: StatusCodes.FORBIDDEN })

    proposalRepository.findById.mockResolvedValue(makeProposal({ status: 'IMPLEMENTED' }))
    await expect(useCase.executeUndoImplementationToToImplement(1, 3)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST,
    })
    proposalRepository.findById.mockResolvedValue(
      makeProposal({ status: 'IMPLEMENTATION', championId: 3 }),
    )
    await expect(useCase.executeUndoImplementationToToImplement(1, 99)).rejects.toMatchObject({
      statusCode: StatusCodes.FORBIDDEN,
    })
    proposalRepository.findById.mockResolvedValue(makeProposal({ status: 'IMPLEMENTATION' }))
    await expect(useCase.executeUndoToImplementToUnderValidation(1, 3)).rejects.toMatchObject({
      statusCode: StatusCodes.BAD_REQUEST,
    })
    proposalRepository.findById.mockResolvedValue(
      makeProposal({ status: 'TO_IMPLEMENT', championId: 3 }),
    )
    await expect(useCase.executeUndoToImplementToUnderValidation(1, 99)).rejects.toMatchObject({
      statusCode: StatusCodes.FORBIDDEN,
    })

    proposalRepository.findById.mockResolvedValue(
      makeProposal({ status: 'IMPLEMENTED', championId: 3 }),
    )
    await expect(
      useCase.executeUndoImplementedToImplementation(1, 99, Role.OPERATOR),
    ).rejects.toMatchObject({ statusCode: StatusCodes.FORBIDDEN })
    proposalRepository.findById.mockResolvedValue(
      makeProposal({
        status: 'IMPLEMENTED',
        championId: 3,
        completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      }),
    )
    await expect(
      useCase.executeUndoImplementedToImplementation(1, 3, Role.OPERATOR),
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })

    proposalRepository.findById.mockResolvedValue(makeProposal({ status: 'WAITING_APPROVAL' }))
    await expect(
      useCase.executeUndoImplementedToWaitingApproval(1, Role.ADMIN),
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
    proposalRepository.findById.mockResolvedValue(
      makeProposal({ status: 'IMPLEMENTED', championId: 3 }),
    )
    await expect(
      useCase.executeUndoImplementedToWaitingApproval(1, Role.OPERATOR),
    ).rejects.toMatchObject({ statusCode: StatusCodes.FORBIDDEN })
    proposalRepository.findById.mockResolvedValue(
      makeProposal({
        status: 'IMPLEMENTED',
        completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      }),
    )
    await expect(
      useCase.executeUndoImplementedToWaitingApproval(1, Role.MANAGER),
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
    proposalRepository.findById.mockResolvedValue(makeProposal({ status: 'WAITING_APPROVAL' }))
    await expect(
      useCase.executeUndoImplementedToImplementation(1, 3, Role.ADMIN),
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
  })

  it('reviews manager approval and rejection', async () => {
    proposalRepository.findById.mockResolvedValue(makeProposal({ status: 'WAITING_APPROVAL' }))
    proposalRepository.updateProposal.mockResolvedValue('rejected')
    await expect(
      useCase.executeImplementedProposalManagerReview(1, 'REJECTED', ' note '),
    ).resolves.toBe('rejected')

    suggestionRepository.findByProposalId.mockResolvedValue([{ id: 11 }])
    categoryRepository.findById.mockResolvedValue({ categoryReward: 25 })
    payoutRepository.findBySuggestionIds.mockResolvedValue([])
    proposalRepository.updateApprovedProposalAndCreatePayouts.mockResolvedValue('implemented')
    await expect(useCase.executeImplementedProposalManagerReview(1, 'IMPLEMENTED')).resolves.toBe(
      'implemented',
    )
    await expect(
      useCase.executeImplementedProposalManagerReview(1, 'INVALID'),
    ).rejects.toBeInstanceOf(AppError)
    await expect(
      useCase.executeImplementedProposalManagerReview(1, 'REJECTED', ' '),
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
    proposalRepository.findById.mockResolvedValue(makeProposal({ status: 'IMPLEMENTED' }))
    await expect(
      useCase.executeImplementedProposalManagerReview(1, 'IMPLEMENTED'),
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
    proposalRepository.findById.mockResolvedValue(makeProposal({ status: 'WAITING_APPROVAL' }))
    suggestionRepository.findByProposalId.mockResolvedValue([{ id: 11 }])
    categoryRepository.findById.mockResolvedValue({ categoryReward: 25 })
    payoutRepository.findBySuggestionIds.mockResolvedValue([{ id: 99 }])
    await expect(
      useCase.executeImplementedProposalManagerReview(1, 'IMPLEMENTED'),
    ).rejects.toMatchObject({ statusCode: StatusCodes.BAD_REQUEST })
  })
})
