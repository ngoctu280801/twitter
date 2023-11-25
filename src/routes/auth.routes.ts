import { Router } from 'express'
import {
  emailVerifyController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController
} from '~/controllers/auth.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
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

/**
 * path:auth/verify-email
 * Body: {email_verify_token:string}
 */
authRouter.post('/verify-email', emailVerifyTokenValidator, wrapErrorHandler(emailVerifyController))

/**
 * path:auth/resend-verify-email
 * Body: {}
 * Header: {Authorization: Bearer <access_token>}
 */
authRouter.post('/resend-verify-email', accessTokenValidator, wrapErrorHandler(resendEmailVerifyController))

export default authRouter
