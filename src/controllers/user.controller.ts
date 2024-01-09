import { ParamsDictionary } from 'express-serve-static-core'
import { Response, Request, NextFunction } from 'express'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { ChangePasswordBody, FollowUserBody, TokenPayload, UpdateProfileBody } from '~/models/requests/User.request'
import userService from '~/services/users.services'
import { USER_MESSAGES } from '~/constants/message'

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

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordBody>,
  res: Response
) => {
  const { user_id } = req.decodeAuthorization as TokenPayload
  const { body } = req
  await userService.changePassword(user_id, body.new_password)
  return res.status(HTTP_STATUS.OK).json({ message: USER_MESSAGES.CHANGE_PASSWORD_SUCCESS })
}

export const followUserController = async (req: Request<ParamsDictionary, any, FollowUserBody>, res: Response) => {
  const { user_id } = req.decodeAuthorization as TokenPayload
  const { body } = req
  const followedUser = body.followed_user_id
  const result = await userService.followUser(user_id, followedUser)
  return res.status(HTTP_STATUS.OK).json(result)
}
