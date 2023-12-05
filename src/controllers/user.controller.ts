import { ParamsDictionary } from 'express-serve-static-core'
import { Response, Request, NextFunction } from 'express'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { TokenPayload, UpdateProfileBody } from '~/models/requests/User.request'
import userService from '~/services/users.services'

export const meController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decodeAuthorization as TokenPayload
  const user = await userService.getUserById(user_id)
  return res.status(HTTP_STATUS.OK).json(user)
}

export const updateProfileController = async (
  req: Request<ParamsDictionary, any, UpdateProfileBody>,
  res: Response
) => {
  const { user_id } = req.decodeAuthorization as TokenPayload
  const { body } = req
  const user = await userService.updateProfile(user_id, body)
  return res.status(HTTP_STATUS.OK).json(user)
}
