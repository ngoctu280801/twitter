import { Router } from 'express'
import { loginController, registerController } from '~/controllers/auth.controllers'
import { loginValidator, registerValidator } from '~/middlewares/auth.middlewares'
import { wrapAsync } from '~/utils/handlers'
const authRouter = Router()

authRouter.post('/login', loginValidator, loginController)

/**
 * body:{name,email,password,date_of_birth}
 */
authRouter.post('/register', registerValidator, wrapAsync(registerController))
export default authRouter
