import { Router } from 'express'
import { createTweetController } from '~/controllers/tweet.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { createTweetValidator } from '~/middlewares/tweet.middleware'
import { verifiedUserValidator } from '~/middlewares/user.middlewares'

import { wrapErrorHandler } from '~/utils/handlers'

const tweetRoute = Router()

/**
 * Description: create tweet
 * Header: {Authorization: 'Bearer ' access_token}
 * Body: {user_id:string}
 */
tweetRoute.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapErrorHandler(createTweetController)
)

export default tweetRoute
