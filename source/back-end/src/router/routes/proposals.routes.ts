import { Router } from 'express'
import { ProposalsController } from '../../controllers/proposals.controller'
import { validate } from '../../middlewares/validation.middleware'
import {
  createProposalSchema,
  proposalIdSchema,
  updateProposalWithChampion,
} from '../../utils/schemas/proposal.schemas'

const proposalsRoutes = Router()

proposalsRoutes.get('/', ProposalsController.handleFindAll)
proposalsRoutes.get('/with-employees', ProposalsController.handleFindAllWithEmployees)
proposalsRoutes.get('/:id', validate(proposalIdSchema), ProposalsController.handleFindById)
proposalsRoutes.post('/', validate(createProposalSchema), ProposalsController.handleCreate)
proposalsRoutes.put(
  '/:id/define-champion',
  validate(updateProposalWithChampion),
  ProposalsController.handleDefineChampion,
)
proposalsRoutes.put('/:id/reject', validate(proposalIdSchema), ProposalsController.handleRejection)

export { proposalsRoutes }
