import { ParamsDictionary } from 'express-serve-static-core'
import { Response, Request, NextFunction } from 'express'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { ChangePasswordBody, FollowUserBody, TokenPayload, UpdateProfileBody } from '~/models/requests/User.request'
import userService from '~/services/users.services'
import { USER_MESSAGES } from '~/constants/message'
import databaseService from '~/services/database.services'
import { ObjectId } from 'mongodb'

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

export const unFollowUserController = async (req: Request<ParamsDictionary, any, FollowUserBody>, res: Response) => {
  const { user_id } = req.decodeAuthorization as TokenPayload
  const { params } = req

  const followedUser = params.id

  const user = await databaseService.users.findOne({ _id: new ObjectId(followedUser) })

  if (!user) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: USER_MESSAGES.USER_NOT_FOUND })

  // check followed before
  const record = await databaseService.followers.findOne({
    user_id: new ObjectId(user_id),
    followed_user_id: new ObjectId(followedUser)
  })
  if (!record) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: USER_MESSAGES.NOT_FOLLOWED })

  const result = await userService.unfollowUser(user_id, followedUser)
  return res.status(HTTP_STATUS.OK).json(result)
}
