import { Router } from 'express'
import { loginController, registerController } from '~/controllers/auth.controllers'
import { loginValidator, registerValidator } from '~/middlewares/auth.middlewares'
const authRouter = Router()

authRouter.post('/login', loginValidator, loginController)

/**
 * body:{name,email,password,date_of_birth}
 */
authRouter.post('/register', registerValidator, registerController)
export default authRouter
