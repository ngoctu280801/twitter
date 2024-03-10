import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { TWEET_MESSAGES, USER_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.request'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'
import tweetsServices from '~/services/tweet.services'
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

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({ status: HTTP_STATUS.BAD_REQUEST, message: TWEET_MESSAGES.TWEET_ID_INVALID })
            }

            const tweet = (
              await databaseService.tweets
                .aggregate<Tweet>([
                  {
                    $match: {
                      _id: new ObjectId(value)
                    }
                  },
                  {
                    $lookup: {
                      from: 'hashtags',
                      localField: 'hashtags',
                      foreignField: '_id',
                      as: 'hashtags'
                    }
                  },
                  {
                    $lookup: {
                      from: 'users',
                      localField: 'mentions',
                      foreignField: '_id',
                      as: 'mentions'
                    }
                  },
                  {
                    $addFields: {
                      mentions: {
                        $map: {
                          input: '$mentions',
                          as: 'mention',
                          in: {
                            _id: '$$mention._id',
                            name: '$$mention.name',
                            username: '$$mention.username',
                            email: '$$mention.email'
                          }
                        }
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: 'bookmarks',
                      localField: '_id',
                      foreignField: 'tweet_id',
                      as: 'bookmarks'
                    }
                  },
                  {
                    $addFields: {
                      bookmarks: {
                        $size: '$bookmarks'
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: 'tweets',
                      localField: '_id',
                      foreignField: 'parent_id',
                      as: 'tweet_children'
                    }
                  },
                  {
                    $addFields: {
                      retweet_count: {
                        $size: {
                          $filter: {
                            input: '$tweet_children',
                            as: 'retweet',
                            cond: {
                              $eq: ['$$retweet.type', 1]
                            }
                          }
                        }
                      },
                      quote_count: {
                        $size: {
                          $filter: {
                            input: '$tweet_children',
                            as: 'retweet',
                            cond: {
                              $eq: ['$$retweet.type', 2]
                            }
                          }
                        }
                      },
                      comment_count: {
                        $size: {
                          $filter: {
                            input: '$tweet_children',
                            as: 'retweet',
                            cond: {
                              $eq: ['$$retweet.type', 3]
                            }
                          }
                        }
                      },
                      views: {
                        $add: ['$user_views', '$guest_views']
                      }
                    }
                  },
                  {
                    $project: {
                      tweet_children: 0
                    }
                  }
                ])
                .toArray()
            )[0]

            if (!tweet) {
              throw new ErrorWithStatus({ status: HTTP_STATUS.NOT_FOUND, message: TWEET_MESSAGES.TWEET_ID_INVALID })
            }

            req.tweet = tweet
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const audienceValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tweet = req.tweet as Tweet

    const { user_id } = req.decodeAuthorization as TokenPayload

    if (tweet.audience === TweetAudience.TwitterCircle) {
      //check is logged user
      if (!req.decodeAuthorization) {
        throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED })
      }
    }

    //check is banned audience
    const author = await databaseService.users.findOne({ _id: tweet.user_id })

    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.NOT_FOUND, message: USER_MESSAGES.USER_NOT_FOUND })
    }

    // user in tweet circle of author
    const isInTweeterCircle = author.tweet_circle?.find((item) => item.equals(user_id))

    if (!isInTweeterCircle && !author._id.equals(user_id) && tweet.audience === TweetAudience.TwitterCircle) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.FORBIDDEN, message: TWEET_MESSAGES.TWEET_NOT_PUBLIC })
    }
    next()
  } catch (error) {
    next(error)
  }
}
