import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { TWEET_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validation'

export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [numberEnumToArray(TweetType)],
        errorMessage: TWEET_MESSAGES.INVALID_TYPE
      }
    },
    audience: {
      isIn: {
        options: [numberEnumToArray(TweetAudience)],
        errorMessage: TWEET_MESSAGES.INVALID_AUDIENCE
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType

          if (type === TweetType.Tweet && value) {
            throw new ErrorWithStatus({ status: HTTP_STATUS.BAD_REQUEST, message: TWEET_MESSAGES.SHOULD_BE_NO_PARENT })
          } else if (type !== TweetType.Tweet && !ObjectId.isValid(value)) {
            throw new ErrorWithStatus({ status: HTTP_STATUS.BAD_REQUEST, message: TWEET_MESSAGES.PARENT_ID_INVALID })
          }

          return true
        }
      }
    },
    content: {
      custom: {
        options: (value, { req }) => {
          const { type, mentions, hashtags } = req.body

          if (type === TweetType.Retweet && value !== '') {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: TWEET_MESSAGES.CONTENT_MUST_BE_EMPTY
            })
          } else if (type !== TweetType.Retweet && isEmpty(hashtags) && isEmpty(mentions) && value === '')
            throw new ErrorWithStatus({ status: HTTP_STATUS.BAD_REQUEST, message: TWEET_MESSAGES.CONTENT_INVALID })

          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (!value.every((item: any) => typeof item === 'string')) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: TWEET_MESSAGES.HASHTAGS_MUST_BE_STRING_ARRAY
            })
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (!value.every((item: any) => ObjectId.isValid(item))) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: TWEET_MESSAGES.MENTIONS_MUST_BE_OBJECT_ID_ARRAY
            })
          }

          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (
            !value.every((item: any) => {
              typeof item.url !== 'string' || !numberEnumToArray(MediaType).includes(item.type)
            })
          ) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: TWEET_MESSAGES.MEDIA_INVALID
            })
          }
          return true
        }
      }
    }
  })
)
