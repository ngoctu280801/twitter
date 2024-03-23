import databaseService from './database.services'

class HashtagServices {
  async getHashtagsByName(name: string) {
    const hashtags = await databaseService.hashtags.find({ name }).collation({
      locale: 'en',
      strength: 2
    })
    return hashtags
  }
}

const hashtagServices = new HashtagServices()

export default hashtagServices
