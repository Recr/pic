import { Router } from 'express'
import { AuthController } from '../../controllers/auth.controller'
import { validate } from '../../middlewares/validation.middleware'
import { loginSchema } from '../../utils/schemas/auth.shemas'
import { authMiddleware } from '../../middlewares/auth.middeware'

const authRoutes = Router()

authRoutes.post('/login', validate(loginSchema), AuthController.handleLogin)
authRoutes.get('/me', authMiddleware, AuthController.handleGetCurrentUser)

export { authRoutes }
