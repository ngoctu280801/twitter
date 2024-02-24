import { Router } from 'express'
import {
  emailVerifyController,
  forgotPasswordController,
  googleOAuthController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  verifyForgotPasswordController
} from '~/controllers/auth.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifyForgotPasswordValidator
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
 * path:auth/refresh_token
 * Body: {refresh_token:string}
 */
authRouter.post('/refresh-token', refreshTokenValidator, wrapErrorHandler(refreshTokenController))

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

/**
 * path:auth/forgot-password
 * Body: {email: string}
 */
authRouter.post('/forgot-password', forgotPasswordValidator, wrapErrorHandler(forgotPasswordController))

/**
 * path:auth/verify-forgot-password
 * Body: {forgot_password_token: string}
 */
authRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordValidator,
  wrapErrorHandler(verifyForgotPasswordController)
)

/**
 * path:auth/reset-password
 * Body: {forgot_password_token: string, password: string}
 */
authRouter.post('/reset-password', resetPasswordValidator, wrapErrorHandler(resetPasswordController))

/**
 * path:auth/oauth/google
 */
authRouter.get('/oauth/google', wrapErrorHandler(googleOAuthController))

export default authRouter
