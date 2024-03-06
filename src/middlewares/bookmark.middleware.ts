import { checkSchema } from 'express-validator'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { TWEET_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.request'
import bookmarkServices from '~/services/bookmarks.services'
import tweetsServices from '~/services/tweet.services'
import { validate } from '~/utils/validation'

export const createBookmarkValidator = validate(
  checkSchema({
    tweet_id: {
      custom: {
        options: async (value, { req }) => {
          const { user_id } = req.decodeAuthorization as TokenPayload
          const tweet = await tweetsServices.getTweetById(value)

          if (!tweet) {
            throw new ErrorWithStatus({ status: HTTP_STATUS.NOT_FOUND, message: TWEET_MESSAGES.TWEET_ID_INVALID })
          }

          const existingTweet = await bookmarkServices.getBookmarkByUserIdAndTweetId(user_id, value)

          if (existingTweet)
            throw new ErrorWithStatus({ status: HTTP_STATUS.BAD_REQUEST, message: TWEET_MESSAGES.TWEET_BOOKMARKED })

          return true
        }
      }
    }
  })
)
