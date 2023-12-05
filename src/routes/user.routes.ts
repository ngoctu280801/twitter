import { Router } from 'express'
import { meController, updateProfileController } from '~/controllers/user.controller'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { verifiedUserValidator } from '~/middlewares/user.middlewares'
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
userRoute.patch('/me', accessTokenValidator, verifiedUserValidator, wrapErrorHandler(updateProfileController))

export default userRoute
