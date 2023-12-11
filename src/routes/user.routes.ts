import { Router } from 'express'
import { meController, updateProfileController } from '~/controllers/user.controller'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { updateMeValidator, verifiedUserValidator } from '~/middlewares/user.middlewares'
import { UpdateProfileBody } from '~/models/requests/User.request'
import { wrapErrorHandler } from '~/utils/handlers'
const userRoute = Router()

/**
 * Description: Get my profile
 * Header: {Authorization: 'Bearer ' <access_token></access_token>}
 */
userRoute.get('/me', accessTokenValidator, wrapErrorHandler(meController))

/**
 * Description: Update my profile
 * Header: {Authorization: 'Bearer ' <access_token></access_token>}
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

export default userRoute
