import { Router } from 'express'
import { loginController, registerController } from '~/controllers/auth.controllers'
import { loginValidator, registerValidator } from '~/middlewares/auth.middlewares'
import { wrapErrorHandler } from '~/utils/handlers'
const authRouter = Router()

authRouter.post('/login', loginValidator, wrapErrorHandler(loginController))

/**
 * body:{name,email,password,date_of_birth}
 */
authRouter.post('/register', registerValidator, wrapErrorHandler(registerController))
export default authRouter
