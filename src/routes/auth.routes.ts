import { Router } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/auth.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/auth.middlewares'
import { wrapErrorHandler } from '~/utils/handlers'
const authRouter = Router()

/**
 * path:auth/login
 * Body:  {email:string, password:string}
 */
authRouter.post('/login', loginValidator, wrapErrorHandler(loginController))

/**
 * body:{name,email,password,date_of_birth}
 */
authRouter.post('/register', registerValidator, wrapErrorHandler(registerController))

/**
 * path:auth/logout
 * Body: {refresh_token:string}
 * Header: {Authorization: Bearer <access_token>}
 */
authRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapErrorHandler(logoutController))

export default authRouter
