import { checkSchema } from 'express-validator'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { TWEET_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import tweetsServices from '~/services/tweet.services'
import { validate } from '~/utils/validation'

export const createBookmarkValidator = validate(
  checkSchema({
    tweet_id: {
      custom: {
        options: async (value, { req }) => {
          const tweet = await tweetsServices.getTweetById(value)

          if (!tweet) {
            throw new ErrorWithStatus({ status: HTTP_STATUS.NOT_FOUND, message: TWEET_MESSAGES.TWEET_ID_INVALID })
          }

          return true
        }
      }
    }
  })
)
