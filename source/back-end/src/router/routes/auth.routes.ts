import { Router } from 'express'
import { AuthController } from '../../controllers/auth.controller'
import { validate } from '../../middlewares/validation.middleware'
import {
  changePasswordSchema,
  loginSchema,
  requestPasswordResetTokenSchema,
  resetPasswordSchema,
} from '../../utils/schemas/auth.shemas'
import { authMiddleware } from '../../middlewares/auth.middeware'

const authRoutes = Router()

authRoutes.post('/login', validate(loginSchema), AuthController.handleLogin)
authRoutes.get('/me', authMiddleware, AuthController.handleGetCurrentUser)
authRoutes.post('/refresh', AuthController.handleRefreshToken)
authRoutes.post('/logout', authMiddleware, AuthController.handleLogout)
authRoutes.post(
  '/change-password',
  authMiddleware,
  validate(changePasswordSchema),
  AuthController.handleChangePassword,
)

authRoutes.post(
  '/request-password-reset-token',
  validate(requestPasswordResetTokenSchema),
  AuthController.handleRequestPasswordResetToken,
)

authRoutes.post(
  '/reset-password',
  validate(resetPasswordSchema),
  AuthController.handleResetPassword,
)

export { authRoutes }
