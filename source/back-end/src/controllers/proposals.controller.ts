import { NextFunction, Request, Response } from 'express'
import { CreateProposalInput, DetailedProposalFilters } from '../utils/types/proposals.types'
import { AppError } from '../errors/AppError'
import { StatusCodes } from 'http-status-codes'
import path from 'node:path'
import { createReadStream } from 'node:fs'
import fs from 'node:fs/promises'
import { Role } from '../utils/types/employees.types'
import { makeProposalsUseCase } from '../factories/make-proposal-use-case.factory'

export const ProposalsController = {
  async handleFindAll(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalUseCase = makeProposalsUseCase()
      const proposals = await proposalUseCase.executeFindAll()
      res.send(proposals)
    } catch (error) {
      next(error)
    }
  },

  async handleFindAllProposalsDetailed(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalUseCase = makeProposalsUseCase()

      const role = req.user?.role as Role | undefined
      const userId = Number(req.user?.sub)

      const pagination = {
        limit: Number(req.query.limit) || 50,
        offset: Number(req.query.offset) || 0,
      }

      const parseOptionalNumber = (value: unknown) => {
        if (typeof value !== 'string' || value.trim() === '') {
          return undefined
        }

        const parsedValue = Number(value)
        return Number.isFinite(parsedValue) ? parsedValue : undefined
      }

      const parseOptionalDate = (value: unknown) => {
        if (typeof value !== 'string' || value.trim() === '') {
          return undefined
        }

        const parsedValue = new Date(value)
        return Number.isNaN(parsedValue.getTime()) ? undefined : parsedValue
      }

      const filters: DetailedProposalFilters = {}

      const idFilter = parseOptionalNumber(req.query.id)
      if (idFilter !== undefined) {
        filters.id = idFilter
      }

      const reFilter = parseOptionalNumber(req.query.re)
      if (reFilter !== undefined) {
        filters.re = reFilter
      }

      const employeeNameFilter =
        typeof req.query.employeeName === 'string' && req.query.employeeName.trim() !== ''
          ? req.query.employeeName.trim()
          : undefined
      if (employeeNameFilter) {
        filters.employeeName = employeeNameFilter
      }

      const managerNameFilter =
        typeof req.query.managerName === 'string' && req.query.managerName.trim() !== ''
          ? req.query.managerName.trim()
          : undefined
      if (managerNameFilter) {
        filters.managerName = managerNameFilter
      }

      const championNameFilter =
        typeof req.query.championName === 'string' && req.query.championName.trim() !== ''
          ? req.query.championName.trim()
          : undefined
      if (championNameFilter) {
        filters.championName = championNameFilter
      }

      const descriptionFilter =
        typeof req.query.description === 'string' && req.query.description.trim() !== ''
          ? req.query.description.trim()
          : undefined
      if (descriptionFilter) {
        filters.description = descriptionFilter
      }

      const dateFromFilter = parseOptionalDate(req.query.dateFrom)
      if (dateFromFilter) {
        filters.dateFrom = dateFromFilter
      }

      const dateToFilter = parseOptionalDate(req.query.dateTo)
      if (dateToFilter) {
        filters.dateTo = dateToFilter
      }

      const statusFilter =
        typeof req.query.status === 'string' && req.query.status.trim() !== ''
          ? req.query.status.trim()
          : undefined
      if (statusFilter) {
        filters.status = statusFilter
      }

      const categoryIdFilter = parseOptionalNumber(req.query.categoryId)
      if (categoryIdFilter !== undefined) {
        filters.categoryId = categoryIdFilter
      }

      const areaIdFilter = parseOptionalNumber(req.query.areaId)
      if (areaIdFilter !== undefined) {
        filters.areaId = areaIdFilter
      }

      const includeInactiveFilter =
        typeof req.query.includeInactive === 'string' && req.query.includeInactive.trim() !== ''
          ? req.query.includeInactive.trim().toLowerCase() === 'true'
          : undefined
      if (includeInactiveFilter !== undefined) {
        filters.includeInactive = includeInactiveFilter
      }

      if (!role || Number.isNaN(userId)) {
        return next(new AppError('Invalid token payload.', StatusCodes.UNAUTHORIZED))
      }

      const proposals = await proposalUseCase.executeFindAllDetailed(
        role,
        userId,
        pagination,
        filters,
      )
      res.send(proposals)
    } catch (error) {
      next(error)
    }
  },

  async handleFindAllUserProposalsWithEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalUseCase = makeProposalsUseCase()

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
      const proposalUseCase = makeProposalsUseCase()
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
      const proposalUseCase = makeProposalsUseCase()
      const proposals = await proposalUseCase.executeFindAllWithoutManager()
      res.send(proposals)
    } catch (error) {
      next(error)
    }
  },

  async handleFindById(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const proposalUseCase = makeProposalsUseCase()
      const proposals = await proposalUseCase.executeFindById(proposalId)
      res.send(proposals)
    } catch (error) {
      next(error)
    }
  },

  async handleCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateProposalInput = req.body
      const proposalUseCase = makeProposalsUseCase()
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

      const proposalUseCase = makeProposalsUseCase()
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

      const proposalUseCase = makeProposalsUseCase()
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
      const proposalUseCase = makeProposalsUseCase()
      const evidenceFiles = Array.isArray(req.files) ? req.files : undefined
      const updatedProposal = await proposalUseCase.executeDefineManager(
        proposalId,
        data,
        evidenceFiles,
      )
      res.send(updatedProposal)
    } catch (error) {
      next(error)
    }
  },

  async handleAdminRejection(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const rejectionNote = String(req.query.rejectionNote)
      const proposalUseCase = makeProposalsUseCase()
      const updatedProposal = await proposalUseCase.executeAdminRejection(proposalId, rejectionNote)
      res.send(updatedProposal)
    } catch (error) {
      next(error)
    }
  },

  async handleRejectProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const userId = Number(req.user?.sub)
      const rejectionNote = String(req.query.rejectionNote ?? '')

      const proposalUseCase = makeProposalsUseCase()

      const updatedProposal = await proposalUseCase.executeRejectProposal(
        proposalId,
        userId,
        rejectionNote,
      )
      res.send(updatedProposal)
    } catch (error) {
      next(error)
    }
  },

  async handleSoftDeleteProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)

      const proposalUseCase = makeProposalsUseCase()

      const updatedProposal = await proposalUseCase.executeSoftDeleteProposal(proposalId)
      res.send(updatedProposal)
    } catch (error) {
      next(error)
    }
  },

  async handleRestoreProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)

      const proposalUseCase = makeProposalsUseCase()

      const updatedProposal = await proposalUseCase.executeRestoreProposal(proposalId)
      res.send(updatedProposal)
    } catch (error) {
      next(error)
    }
  },

  async handleStatusUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const data = req.body
      const evidenceFiles = Array.isArray(req.files) ? req.files : undefined
      const proposalUseCase = makeProposalsUseCase()
      const updatedProposal = await proposalUseCase.executeChampionReview(
        proposalId,
        data.status,
        data.customRewardAmount,
        data.rejectionNote,
        evidenceFiles,
      )
      res.send(updatedProposal)
    } catch (error) {
      next(error)
    }
  },

  async handleUpdateChampionNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const userId = Number(req.user?.sub)
      const data = req.body

      const proposalUseCase = makeProposalsUseCase()

      const updatedProposal = await proposalUseCase.executeUpdateChampionNotes(
        proposalId,
        data,
        userId,
      )
      res.send(updatedProposal)
    } catch (error) {
      next(error)
    }
  },

  async handleDownloadAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const { proposalId, attachmentId } = req.params

      const proposalUseCase = makeProposalsUseCase()

      const attachment = await proposalUseCase.executeGetAttachment(
        Number(proposalId),
        Number(attachmentId),
      )

      if (!attachment) {
        return next(new AppError('Attachment not found', StatusCodes.NOT_FOUND))
      }

      const uploadDir = path.resolve(process.cwd(), 'uploads', 'proposal-attachments')
      const filePath = path.resolve(uploadDir, attachment.relativePath)

      // Verify file exists and get actual file size
      const stats = await fs.stat(filePath)

      // Set proper headers for file download
      res.setHeader('Content-Type', 'application/octet-stream')
      res.setHeader('Content-Length', stats.size)
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${attachment.originalName.replace(/"/g, '\\"')}"`,
      )

      const fileStream = createReadStream(filePath, { highWaterMark: 64 * 1024 })

      fileStream.on('error', (error) => {
        console.error('[DOWNLOAD] File stream error:', {
          message: error.message,
          code: (error as NodeJS.ErrnoException).code,
          path: filePath,
        })
        if (!res.headersSent) {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to read file',
          })
        } else {
          res.end()
        }
      })

      res.on('error', (error) => {
        console.error('[DOWNLOAD] Response error:', {
          message: error.message,
          code: (error as NodeJS.ErrnoException).code,
        })
        fileStream.destroy()
      })

      fileStream.on('close', () => {
        console.log('[DOWNLOAD] Stream closed for:', {
          filename: attachment.originalName,
          fileSize: stats.size,
        })
      })

      fileStream.pipe(res)
    } catch (error) {
      console.error('[DOWNLOAD] Caught error:', error)
      next(error)
    }
  },

  async handleUploadAttachments(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.proposalId)
      const userId = Number(req.user?.sub)
      const role = req.user?.role as Role | undefined
      const files = Array.isArray(req.files) ? req.files : undefined

      if (Number.isNaN(proposalId) || Number.isNaN(userId) || !role) {
        return next(new AppError('Invalid token payload.', StatusCodes.UNAUTHORIZED))
      }

      const proposalUseCase = makeProposalsUseCase()

      const createdAttachments = await proposalUseCase.executeAddAttachments(
        proposalId,
        userId,
        role,
        files,
      )

      res.status(StatusCodes.CREATED).send(createdAttachments)
    } catch (error) {
      next(error)
    }
  },

  async handleDeleteAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.proposalId)
      const attachmentId = Number(req.params.attachmentId)
      const userId = Number(req.user?.sub)
      const role = req.user?.role as Role | undefined

      if (Number.isNaN(proposalId) || Number.isNaN(attachmentId) || Number.isNaN(userId) || !role) {
        return next(new AppError('Invalid token payload.', StatusCodes.UNAUTHORIZED))
      }

      const proposalUseCase = makeProposalsUseCase()

      await proposalUseCase.executeDeleteAttachment(proposalId, attachmentId, userId, role)

      res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
      next(error)
    }
  },

  async handleUndoImplementedToWaitingApproval(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const userId = Number(req.user?.sub)
      const role = req.user?.role as Role | undefined

      if (Number.isNaN(proposalId) || Number.isNaN(userId) || !role) {
        return next(new AppError('Invalid token payload.', StatusCodes.UNAUTHORIZED))
      }

      const proposalUseCase = makeProposalsUseCase()

      const proposal = await proposalUseCase.executeUndoImplementedToWaitingApproval(
        proposalId,
        role,
      )
      res.send(proposal)
    } catch (error) {
      next(error)
    }
  },

  async handleUndoImplementedToImplementation(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const userId = Number(req.user?.sub)
      const role = req.user?.role as Role | undefined

      if (Number.isNaN(proposalId) || Number.isNaN(userId) || !role) {
        return next(new AppError('Invalid token payload.', StatusCodes.UNAUTHORIZED))
      }

      const proposalUseCase = makeProposalsUseCase()

      const proposal = await proposalUseCase.executeUndoImplementedToImplementation(
        proposalId,
        userId,
        role,
      )
      res.send(proposal)
    } catch (error) {
      next(error)
    }
  },

  async handleUndoImplementationToToImplement(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const userId = Number(req.user?.sub)

      if (Number.isNaN(proposalId) || Number.isNaN(userId)) {
        return next(new AppError('Invalid token payload.', StatusCodes.UNAUTHORIZED))
      }

      const proposalUseCase = makeProposalsUseCase()

      const proposal = await proposalUseCase.executeUndoImplementationToToImplement(
        proposalId,
        userId,
      )
      res.send(proposal)
    } catch (error) {
      next(error)
    }
  },

  async handleUndoToImplementToUnderValidation(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const userId = Number(req.user?.sub)

      if (Number.isNaN(proposalId) || Number.isNaN(userId)) {
        return next(new AppError('Invalid token payload.', StatusCodes.UNAUTHORIZED))
      }

      const proposalUseCase = makeProposalsUseCase()

      const proposal = await proposalUseCase.executeUndoToImplementToUnderValidation(
        proposalId,
        userId,
      )
      res.send(proposal)
    } catch (error) {
      next(error)
    }
  },

  async handleUndoRejectedToUnderValidation(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const userId = Number(req.user?.sub)

      if (Number.isNaN(proposalId) || Number.isNaN(userId)) {
        return next(new AppError('Invalid token payload.', StatusCodes.UNAUTHORIZED))
      }

      const proposalUseCase = makeProposalsUseCase()

      const proposal = await proposalUseCase.executeUndoRejectedToUnderValidation(
        proposalId,
        userId,
      )
      res.send(proposal)
    } catch (error) {
      next(error)
    }
  },

  async handleUndoRejectedToDefineChampion(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const userId = Number(req.user?.sub)
      const role = req.user?.role as Role | undefined

      if (Number.isNaN(proposalId) || Number.isNaN(userId) || !role) {
        return next(new AppError('Invalid token payload.', StatusCodes.UNAUTHORIZED))
      }

      const proposalUseCase = makeProposalsUseCase()

      const proposal = await proposalUseCase.executeUndoRejectedToDefineChampion(
        proposalId,
        userId,
        role,
      )
      res.send(proposal)
    } catch (error) {
      next(error)
    }
  },

  async handleUpdateProposalManager(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const userId = Number(req.user?.sub)

      if (Number.isNaN(proposalId) || Number.isNaN(userId)) {
        return next(new AppError('Invalid token payload.', StatusCodes.UNAUTHORIZED))
      }

      const data = req.body
      const proposalUseCase = makeProposalsUseCase()

      const proposal = await proposalUseCase.executeUpdateProposalManager(
        proposalId,
        data.managerRe,
      )
      res.send(proposal)
    } catch (error) {
      next(error)
    }
  },

  async handleUpdateProposalChampion(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const userId = Number(req.user?.sub)

      if (Number.isNaN(proposalId) || Number.isNaN(userId)) {
        return next(new AppError('Invalid token payload.', StatusCodes.UNAUTHORIZED))
      }

      const data = req.body
      const proposalUseCase = makeProposalsUseCase()

      const proposal = await proposalUseCase.executeUpdateProposalChampion(
        proposalId,
        userId,
        data.championRe,
      )
      res.send(proposal)
    } catch (error) {
      next(error)
    }
  },

  async handleImplementedProposalManagerReview(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Number(req.params.id)
      const userId = Number(req.user?.sub)

      if (Number.isNaN(proposalId) || Number.isNaN(userId)) {
        return next(new AppError('Invalid token payload.', StatusCodes.UNAUTHORIZED))
      }

      const data = req.body
      const proposalUseCase = makeProposalsUseCase()

      const proposal = await proposalUseCase.executeImplementedProposalManagerReview(
        proposalId,
        data.status,
        data.rejectionNote,
      )
      res.send(proposal)
    } catch (error) {
      next(error)
    }
  },
}
