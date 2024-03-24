import { SearchQuery } from '~/models/requests/Search.request'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId } from 'mongodb'
import { MediaType, MediaTypeQuery, TweetAudience, TweetType } from '~/constants/enum'
import { PAGINATION } from '~/constants/pagination'
import hashtagServices from './hashtags.services'

interface ISearch extends SearchQuery {
  user_id: string
}

const conditionTweetAggregations = (user_id: string) => [
  {
    $lookup: {
      from: 'users',
      localField: 'user_id',
      foreignField: '_id',
      as: 'user'
    }
  },
  {
    $unwind: {
      path: '$user'
    }
  },
  {
    $match: {
      $or: [
        {
          audience: TweetAudience.Everyone
        },
        {
          $or: [
            {
              $and: [
                {
                  audience: TweetAudience.TwitterCircle
                },
                {
                  'user.tweet_circle': {
                    $elemMatch: {
                      $eq: new ObjectId(user_id)
                    }
                  }
                }
              ]
            },
            {
              user_id: new ObjectId(user_id)
            }
          ]
        }
      ]
    }
  }
]

const tweetAggregations = ({ user_id, limit, page }: { user_id: string; limit: string; page: string }) => [
  ...conditionTweetAggregations(user_id),
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
              $eq: ['$$retweet.type', TweetType.Retweet]
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
              $eq: ['$$retweet.type', TweetType.Comment]
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
              $eq: ['$$retweet.type', TweetType.QuoteTweet]
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
      tweet_children: 0,
      user: {
        password: 0,
        email_verify_token: 0,
        forgot_password_token: 0,
        tweet_circle: 0,
        date_of_birth: 0
      }
    }
  },
  {
    $skip: Number(limit) * Number(page) || PAGINATION.LIMIT * PAGINATION.PAGE
  },
  {
    $limit: Number(limit) || PAGINATION.LIMIT
  }
]

class SearchServices {
  async search({ content, media_type, limit, page, user_id }: ISearch) {
    let $match: any = {}
    if (content) {
      $match = {
        $text: {
          $search: content
        }
      }
    }

    if (media_type) {
      if (media_type === MediaTypeQuery.Image) {
        $match = { ...$match, 'medias.type': MediaType.Image }
      } else if (media_type === MediaTypeQuery.Video) {
        $match = { ...$match, 'medias.type': { $in: [MediaType.Video] } }
      }
    }

    const [result, total] = await Promise.all([
      databaseService.tweets
        .aggregate<Tweet>([
          {
            $match
          },
          ...tweetAggregations({ user_id, limit, page })
        ])
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match
          },
          ...conditionTweetAggregations(user_id),
          { $count: 'total' }
        ])
        .toArray()
    ])
    return { result, total: total.length ? total[0].total : 0 }
  }

  async searchByHashTags({ content, limit, page, user_id }: ISearch) {
    const hashtags = (await hashtagServices.getHashtagsByName(content)).toArray()

    const ids = (await hashtags).map((hashtag) => hashtag._id)

    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate<Tweet>([
          {
            $match: {
              hashtags: {
                $in: ids
              }
            }
          },
          ...tweetAggregations({ user_id, limit, page })
        ])
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match: {
              hashtags: {
                $in: ids
              }
            }
          },
          ...conditionTweetAggregations(user_id),
          { $count: 'total' }
        ])
        .toArray()
    ])

    return { tweets, total: total.length ? total[0].total : 0 }
  }
}

const searchServices = new SearchServices()

export default searchServices
