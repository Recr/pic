import { Router } from 'express'
import { ProposalsController } from '../../controllers/proposals.controller'
import { validate } from '../../middlewares/validation.middleware'
import {
  createProposalSchema,
  proposalIdSchema,
  updateProposalStatusByChampionSchema,
  updateProposalWithChampion,
} from '../../utils/schemas/proposal.schemas'
import { authMiddleware } from '../../middlewares/auth.middeware'
import { checkRole } from '../../middlewares/role.middleware'
import { Role } from '../../utils/types/employees.types'

const proposalsRoutes = Router()

proposalsRoutes.get('/', authMiddleware, ProposalsController.handleFindAll)
proposalsRoutes.get(
  '/with-employees',
  authMiddleware,
  ProposalsController.handleFindAllUserProposalsWithEmployees,
)
proposalsRoutes.get(
  '/detailed',
  authMiddleware,
  checkRole([Role.ADMIN]),
  ProposalsController.handleFindAllProposalsDetailed,
)
proposalsRoutes.get(
  '/to-define-champion',
  authMiddleware,
  checkRole([Role.ADMIN]),
  ProposalsController.handleFindAllWithoutChampion,
)
proposalsRoutes.get(
  '/:id',
  validate(proposalIdSchema),
  authMiddleware,
  ProposalsController.handleFindById,
)
proposalsRoutes.post('/', validate(createProposalSchema), ProposalsController.handleCreate)
proposalsRoutes.put(
  '/:id/define-champion',
  validate(updateProposalWithChampion),
  authMiddleware,
  checkRole([Role.ADMIN]),
  ProposalsController.handleDefineChampion,
)
proposalsRoutes.put(
  '/:id/champion-review',
  validate(updateProposalStatusByChampionSchema),
  authMiddleware,
  ProposalsController.handleStatusUpdate,
)

proposalsRoutes.put(
  '/:id/admin-rejection',
  validate(proposalIdSchema),
  authMiddleware,
  checkRole([Role.ADMIN]),
  ProposalsController.handleAdminRejection,
)

export { proposalsRoutes }
