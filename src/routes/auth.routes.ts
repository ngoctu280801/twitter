import { Router } from 'express'
import { loginController } from '~/controllers/auth.controllers'
import { loginValidator } from '~/middlewares/auth.middlewares'
const authRouter = Router()

authRouter.post('/login', loginValidator, loginController)
export default authRouter
