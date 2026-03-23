import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middeware'
import { checkRole } from '../../middlewares/role.middleware'
import { Role } from '../../utils/types/employees.types'
import { PayoutController } from '../../controllers/payout.controller'
import { validate } from '../../middlewares/validation.middleware'
import { updatePayoutStatusSchema } from '../../utils/schemas/payout.schemas'

const payoutRoutes = Router()

payoutRoutes.get(
  '/',
  authMiddleware,
  checkRole([Role.ADMIN, Role.HUMAN_RESOURCES]),
  PayoutController.handleFindAll,
)

payoutRoutes.put(
  '/status',
  authMiddleware,
  checkRole([Role.ADMIN, Role.HUMAN_RESOURCES]),
  validate(updatePayoutStatusSchema),
  PayoutController.handleUpdateStatus,
)

export { payoutRoutes }
