import { Response, Request } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/message'
import { LogoutReqBody, RegisterReqBody } from '~/models/requests/User.request'
import User from '~/models/schemas/User.schema'
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
