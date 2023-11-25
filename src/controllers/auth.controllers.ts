import { Response, Request } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/message'
import { EmailVerifyTokenReqBody, LogoutReqBody, RegisterReqBody, TokenPayload } from '~/models/requests/User.request'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user?._id as ObjectId
  const token = await userService.login(user_id.toString())

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
