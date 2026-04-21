import { Router } from 'express'
import { ProposalsController } from '../../controllers/proposals.controller'
import { validate } from '../../middlewares/validation.middleware'
import {
  adminUpdateProposalWithChampion,
  adminRejectionSchema,
  createProposalSchema,
  proposalIdSchema,
  updateProposalNotesByChampionSchema,
  updateProposalStatusByChampionSchema,
  updateProposalWithChampion,
  updateProposalWithManager,
} from '../../utils/schemas/proposal.schemas'
import { authMiddleware } from '../../middlewares/auth.middeware'
import { checkRole } from '../../middlewares/role.middleware'
import { Role } from '../../utils/types/employees.types'
import { uploadProposalAttachment } from '../../middlewares/upload.middleware'

const proposalsRoutes = Router()

proposalsRoutes.get('/', authMiddleware, ProposalsController.handleFindAll)
proposalsRoutes.get(
  '/with-employees',
  authMiddleware,
  ProposalsController.handleFindAllUserProposalsWithEmployees,
)
proposalsRoutes.get('/detailed', authMiddleware, ProposalsController.handleFindAllProposalsDetailed)
proposalsRoutes.get(
  '/to-define-champion',
  authMiddleware,
  ProposalsController.handleFindAllWithoutChampion,
)
proposalsRoutes.get(
  '/to-define-manager',
  authMiddleware,
  checkRole([Role.ADMIN]),
  ProposalsController.handleFindAllWithoutManager,
)

proposalsRoutes.get(
  '/:proposalId/attachments/:attachmentId/download',
  (req, res, next) => {
    next()
  },
  authMiddleware,
  ProposalsController.handleDownloadAttachment,
)

proposalsRoutes.get(
  '/:id',
  validate(proposalIdSchema),
  authMiddleware,
  ProposalsController.handleFindById,
)
proposalsRoutes.post('/', validate(createProposalSchema), ProposalsController.handleCreate)
proposalsRoutes.put(
  '/:id/admin-define-champion',
  validate(adminUpdateProposalWithChampion),
  authMiddleware,
  checkRole([Role.ADMIN]),
  ProposalsController.handleAdminDefineChampion,
)
proposalsRoutes.put(
  '/:id/define-champion',
  validate(updateProposalWithChampion),
  authMiddleware,
  ProposalsController.handleDefineChampion,
)
proposalsRoutes.put(
  '/:id/reject',
  validate(adminRejectionSchema),
  authMiddleware,
  ProposalsController.handleRejectProposal,
)
proposalsRoutes.put(
  '/:id/define-manager',
  validate(updateProposalWithManager),
  authMiddleware,
  checkRole([Role.ADMIN]),
  ProposalsController.handleDefineManager,
)
proposalsRoutes.put(
  '/:id/champion-review',
  authMiddleware,
  uploadProposalAttachment.array('evidenceFiles', 5),
  validate(updateProposalStatusByChampionSchema),
  ProposalsController.handleStatusUpdate,
)

proposalsRoutes.put(
  '/:id/champion-notes',
  authMiddleware,
  validate(updateProposalNotesByChampionSchema),
  ProposalsController.handleUpdateChampionNotes,
)

proposalsRoutes.put(
  '/:id/admin-rejection',
  validate(adminRejectionSchema),
  authMiddleware,
  checkRole([Role.ADMIN]),
  ProposalsController.handleAdminRejection,
)

export { proposalsRoutes }
