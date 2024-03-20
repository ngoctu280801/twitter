import { Router } from 'express'
import {
  createTweetController,
  getNewFeedController,
  getTweetChildrenController,
  getTweetDetailController
} from '~/controllers/tweet.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { paginationValidator } from '~/middlewares/pagination.middleware'
import {
  audienceValidator,
  createTweetValidator,
  tweetIdValidator,
  tweetTypeChildrenValidator
} from '~/middlewares/tweet.middleware'
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

/**
 * Description: get tweet children
 * Header: {Authorization: 'Bearer ' access_token}
 * Query:{limit:number, page:number, tweet_type: TweetType}
 */
tweetRoute.get(
  '/:tweet_id/children',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  tweetTypeChildrenValidator,
  paginationValidator,
  wrapErrorHandler(getTweetChildrenController)
)

/**
 * Description: get tweets in new feed
 * Header: {Authorization: 'Bearer ' access_token}
 * Query:{limit:number, page:number}
 */
tweetRoute.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  wrapErrorHandler(getNewFeedController)
)

export default tweetRoute
