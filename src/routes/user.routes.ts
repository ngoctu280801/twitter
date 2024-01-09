import { Router } from 'express'
import { changePasswordController, meController, updateProfileController } from '~/controllers/user.controller'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { changePasswordValidator, updateMeValidator, verifiedUserValidator } from '~/middlewares/user.middlewares'
import { ChangePasswordBody, UpdateProfileBody } from '~/models/requests/User.request'
import { wrapErrorHandler } from '~/utils/handlers'
const userRoute = Router()

/**
 * Description: Get my profile
 * Header: {Authorization: 'Bearer ' <access_token></access_token>}
 */
userRoute.get('/me', accessTokenValidator, wrapErrorHandler(meController))

/**
 * Description: Update my profile
 * Header: {Authorization: 'Bearer ' access_token}
 * Body: UserSchema
 */
userRoute.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateProfileBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapErrorHandler(updateProfileController)
)

/**
 * Description: Change password
 * Header: {Authorization: 'Bearer ' access_token}
 * Body: ChangePasswordBody
 */
userRoute.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  filterMiddleware<ChangePasswordBody>(['password', 'new_password']),
  wrapErrorHandler(changePasswordController)
)

export default userRoute
