import { Router } from 'express'
import { createTweetController, getTweetDetailController } from '~/controllers/tweet.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { audienceValidator, createTweetValidator, tweetIdValidator } from '~/middlewares/tweet.middleware'
import { isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/user.middlewares'

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

/**
 * Description: get tweet
 * Header: {Authorization: 'Bearer ' access_token}
 */
tweetRoute.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapErrorHandler(getTweetDetailController)
)

export default tweetRoute
