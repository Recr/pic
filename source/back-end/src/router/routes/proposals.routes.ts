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
  softDeleteProposalSchema,
  updateProposalManager,
  updateProposalChampion,
  restoreProposalSchema,
} from '../../utils/schemas/proposal.schemas'
import { authMiddleware } from '../../middlewares/auth.middeware'
import { checkRole } from '../../middlewares/role.middleware'
import { Role } from '../../utils/types/employees.types'
import { uploadProposalAttachment } from '../../middlewares/upload.middleware'
import { parseMultipartJson } from '../../middlewares/multipart-json-parser.middleware'

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
  ProposalsController.handleFindAllWithoutManagerAndChampion,
)

proposalsRoutes.get(
  '/:proposalId/attachments/:attachmentId/download',
  (req, res, next) => {
    next()
  },
  authMiddleware,
  ProposalsController.handleDownloadAttachment,
)

proposalsRoutes.post(
  '/:proposalId/attachments',
  authMiddleware,
  uploadProposalAttachment.array('attachments', 5),
  ProposalsController.handleUploadAttachments,
)

proposalsRoutes.delete(
  '/:proposalId/attachments/:attachmentId',
  authMiddleware,
  ProposalsController.handleDeleteAttachment,
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
  authMiddleware,
  uploadProposalAttachment.array('evidenceFiles', 5),
  parseMultipartJson('data'),
  validate(updateProposalWithManager),
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

proposalsRoutes.delete(
  '/:id',
  validate(softDeleteProposalSchema),
  authMiddleware,
  checkRole([Role.ADMIN]),
  ProposalsController.handleSoftDeleteProposal,
)

proposalsRoutes.put(
  '/:id/restore',
  validate(restoreProposalSchema),
  authMiddleware,
  checkRole([Role.ADMIN]),
  ProposalsController.handleRestoreProposal,
)

proposalsRoutes.put(
  '/:id/undo/implemented-to-waiting-approval',
  authMiddleware,
  ProposalsController.handleUndoImplementedToWaitingApproval,
)

proposalsRoutes.put(
  '/:id/undo/implemented-to-implementation',
  authMiddleware,
  ProposalsController.handleUndoImplementedToImplementation,
)

proposalsRoutes.put(
  '/:id/undo/implementation-to-to-implement',
  authMiddleware,
  ProposalsController.handleUndoImplementationToToImplement,
)

proposalsRoutes.put(
  '/:id/undo/to-implement-to-under-validation',
  authMiddleware,
  ProposalsController.handleUndoToImplementToUnderValidation,
)

proposalsRoutes.put(
  '/:id/undo/under-validation-to-define-champion',
  authMiddleware,
  ProposalsController.handleUndoUnderValidationToDefineChampion,
)

proposalsRoutes.put(
  '/:id/undo/rejected-to-under-validation',
  authMiddleware,
  ProposalsController.handleUndoRejectedToUnderValidation,
)

proposalsRoutes.put(
  '/:id/undo/rejected-to-define-champion',
  authMiddleware,
  ProposalsController.handleUndoRejectedToDefineChampion,
)

proposalsRoutes.put(
  '/:id/update-manager',
  authMiddleware,
  validate(updateProposalManager),
  checkRole([Role.ADMIN]),
  ProposalsController.handleUpdateProposalManager,
)

proposalsRoutes.put(
  '/:id/update-champion',
  authMiddleware,
  validate(updateProposalChampion),
  ProposalsController.handleUpdateProposalChampion,
)

proposalsRoutes.put(
  '/:id/implemented-proposal-manager-review',
  authMiddleware,
  validate(updateProposalStatusByChampionSchema),

  ProposalsController.handleImplementedProposalManagerReview,
)

export { proposalsRoutes }
