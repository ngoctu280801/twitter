import { config } from 'dotenv'
import { Response, Request } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/message'
import {
  EmailVerifyTokenReqBody,
  ForgotPasswordReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload
} from '~/models/requests/User.request'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'

config()

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user?._id as ObjectId
  const token = await userService.login({ userId: user_id.toString(), verify: user.verify })

  return res.json({ ...token, message: USER_MESSAGES.LOGIN_SUCCESS, status: HTTP_STATUS.OK })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await userService.register(req.body)
  return res.json(result)
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)

  return res.status(HTTP_STATUS.OK).json({ message: USER_MESSAGES.LOGOUT_SUCCESS })
}

export const refreshTokenController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { user_id, verify, exp } = req.decodeRefreshToken as TokenPayload
  const { refresh_token } = req.body
  const result = await userService.refreshToken(user_id, verify, refresh_token, exp as number)

  return res.status(HTTP_STATUS.OK).json({ ...result })
}

export const emailVerifyController = async (
  req: Request<ParamsDictionary, any, EmailVerifyTokenReqBody>,
  res: Response
) => {
  const { user_id } = req.decodeEmailVerifyToken as TokenPayload

  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND })
  }

  // if verified
  if (user.email_verify_token === '' && user.verify === UserVerifyStatus.Verified) {
    return res.status(HTTP_STATUS.OK).json({ message: USER_MESSAGES.EMAIL_VERIFIED })
  }

  // if unverified email
  const result = await userService.verifyEmail(user_id)
  return res.status(HTTP_STATUS.OK).json({ message: USER_MESSAGES.EMAIL_VERIFY_SUCCESS, ...result })
}

export const resendEmailVerifyController = async (
  req: Request<ParamsDictionary, any, EmailVerifyTokenReqBody>,
  res: Response
) => {
  const { user_id } = req.decodeAuthorization as TokenPayload

  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND })
  }

  // if verified
  if (user.email_verify_token === '' && user.verify === UserVerifyStatus.Verified) {
    return res.status(HTTP_STATUS.OK).json({ message: USER_MESSAGES.EMAIL_VERIFIED })
  }

  // if unverified email
  await userService.resendVerifyEmail(user_id, user.email)
  return res.status(HTTP_STATUS.OK).json({ message: USER_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { _id, verify, email } = req.user as User
  const result = await userService.forgotPassword({ userId: _id.toString(), verify, email })
  return res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  return res.json({ message: USER_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { user_id, verify } = req.decodeForgotPasswordToken as TokenPayload
  const { password } = req.body

  const result = await userService.resetPassword({ userId: user_id, verify, password })
  return res.json({ message: USER_MESSAGES.RESET_PASSWORD_SUCCESS, ...result })
}

export const googleOAuthController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { code } = req.query
  const result = await userService.oauth(code as string)
  const params = {
    access_token: result.access_token,
    refresh_token: result.refresh_token,
    new_user: result.newUser.toString()
  }
  const url = process.env.CLIENT_REDIRECT + '?' + new URLSearchParams(params)

  return res.redirect(url)
}
