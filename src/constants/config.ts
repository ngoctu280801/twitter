import { config } from 'dotenv'
import argv from 'minimist'
const options = argv(process.argv.slice(2))

export const isProduction = Boolean(options.production)

config()

export const envConfig = {
  port: process.env.PORT,
  auth0ClientRedirect: process.env.CLIENT_REDIRECT,
  jwtSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  jwtSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  accessTokenExpiredIn: process.env.ACCESS_TOKEN_EXPIRED_IN,
  refreshTokenExpiredIn: process.env.REFRESH_TOKEN_EXPIRED_IN,
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  dbUsersCollection: process.env.DB_USERS_COLLECTION as string,
  dbRefreshTokenCollection: process.env.DB_REFRESH_TOKEN_COLLECTION as string,
  dbFollowersCollection: process.env.DB_FOLLOWERS_COLLECTION as string,
  dbTweetCollection: process.env.DB_TWEETS_COLLECTION as string,
  dbHashtagsCollection: process.env.DB_HASHTAGS_COLLECTION as string,
  dbBookmarksCollection: process.env.DB_BOOKMARKS_COLLECTION as string,
  dbConversationsCollection: process.env.DB_CONVERSATIONS_COLLECTION as string,
  dbPasswordSecret: process.env.DB_PASSWORD_SECRET,
  clientUrl: process.env.CLIENT_URL,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUrl: process.env.GOOGLE_REDIRECT_URI,
  awsRegion: process.env.AWS_REGION,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  envSesFromAddress: process.env.SES_FROM_ADDRESS as string
}
