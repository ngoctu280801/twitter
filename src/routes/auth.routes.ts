import { Router } from 'express'
import { loginController, registerController } from '~/controllers/auth.controllers'
import { loginValidator } from '~/middlewares/auth.middlewares'
const authRouter = Router()

authRouter.post('/login', loginValidator, loginController)
authRouter.post('/register', loginValidator, registerController)
export default authRouter
