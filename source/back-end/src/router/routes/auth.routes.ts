import { Router } from 'express'
import { AuthController } from '../../controllers/auth.controller'
import { validate } from '../../middlewares/validation.middleware'
import { loginSchema } from '../../utils/schemas/auth.shemas'

const authRoutes = Router()

authRoutes.post('/login', validate(loginSchema), AuthController.handleLogin)

export { authRoutes }
