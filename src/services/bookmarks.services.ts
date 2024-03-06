import Bookmark from '~/models/schemas/Bookmarks.schema'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'

class BookmarkServices {
  async bookmarkTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.insertOne(
      new Bookmark({
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      })
    )

    const bookmark = await databaseService.bookmarks.findOne({ _id: result.insertedId })

    return bookmark
  }

  async getBookmarkByUserIdAndTweetId(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })

    return result
  }
}

const bookmarkServices = new BookmarkServices()

export default bookmarkServices
