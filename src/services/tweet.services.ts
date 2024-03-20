import { TweetRequestBody } from '~/models/requests/Tweet.request'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtags.schema'
import { TweetAudience, TweetType } from '~/constants/enum'
import { IGetNewFeeds } from '~/interfaces/tweet'
import userService from './users.services'

class TweetsServices {
  async checkAndCreateHashtag(hashtags: string[]) {
    const result = await Promise.all(
      hashtags.map((hashtag) =>
        databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag({ name: hashtag })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      )
    )

    return result.map((item) => item?._id)
  }

  async createTweets(body: TweetRequestBody, user_id: string) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags)

    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: hashtags as ObjectId[],
        mentions: body.mentions.map((item) => new ObjectId(item)),
        parent_id: body.parent_id,
        medias: body.medias,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )

    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })
    return tweet
  }

  async getTweetById(id: string) {
    return await databaseService.tweets.findOne({ _id: new ObjectId(id) })
  }

  async increaseView(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }

    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_view: 1,
          updated_at: 1
        }
      }
    )

    return result
  }

  async getTweetChildren(tweet_id: string, page: number, limit: number, tweet_type: TweetType, user_id?: string) {
    const aggregateConfig = [
      {
        $match: {
          parent_id: new ObjectId(tweet_id),
          type: tweet_type
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
          comment_count: {
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
          quote_count: {
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
      },
      {
        $skip: page * limit
      },
      {
        $limit: limit
      }
    ]

    const tweets = await databaseService.tweets.aggregate<Tweet>(aggregateConfig).toArray()

    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()

    const [total] = await Promise.all([
      databaseService.tweets.countDocuments({ parent_id: new ObjectId(tweet_id), type: tweet_type }),
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      )
    ])

    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) {
        tweet.user_views += 1
      } else tweet.guest_views += 1
    })

    return { tweets, total }
  }

  async getNewFeeds({ user_id, limit, page }: IGetNewFeeds) {
    const users = await userService.getFollowUsers(user_id)

    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()

    const newFeedAggregate = [
      {
        $match: {
          user_id: {
            $in: users
          }
        }
      },
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
            }
          ]
        }
      }
    ]

    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate<Tweet>([
          ...newFeedAggregate,
          {
            $skip: Number(page) * Number(limit)
          },
          {
            $limit: Number(limit)
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
          }
        ])
        .toArray(),
      databaseService.tweets.aggregate([...newFeedAggregate, { $count: 'total' }]).toArray()
    ])

    tweets.forEach((tweet) => {
      tweet.updated_at = date
      tweet.user_views += 1
    })

    // update views
    const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId)
    databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids
        }
      },
      {
        $inc: inc,
        $set: {
          updated_at: date
        }
      }
    )

    return { tweets, total: total[0].total }
  }
}

const tweetsServices = new TweetsServices()
export default tweetsServices
