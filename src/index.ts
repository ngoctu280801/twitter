import express from 'express'
import authRouter from './routes/auth.routes'
import userRoute from './routes/user.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middleware'
import mediaRoute from './routes/media.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import tweetRoute from './routes/tweet.routes'
import bookmarkRoute from './routes/bookmark.routes'
import likeRoute from './routes/like.routes'
import searchRoute from './routes/search.routes'
import { createServer } from 'http'
import cors from 'cors'
import conversationRoute from './routes/conversation.routes'
import initSocket from './utils/socket'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import { envConfig } from './constants/config'

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Twitter Api Document',
      version: '1.0.0'
    }
    // components: {
    //   securitySchemes: {
    //     BearerAuth: {
    //       type: 'http',
    //       scheme: 'bearer',
    //       bearerFormat: 'JWT'
    //     }
    //   }
    // }
  },
  // apis: ['./src/routes/*.routes.ts', './src/models/requests/*.request.ts'] // files containing annotations as above
  apis: ['./swagger.yaml'] // files containing annotations as above
}
const openapiSpecification = swaggerJSDoc(options)
// const file = fs.readFileSync('./swagger.yaml', 'utf8')
// const swaggerDocument = YAML.parse(file)

databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexBookmarks()
})

const app = express()

const httpServer = createServer(app)

//create folder uploads
initFolder()

app.use(cors())
//parse json data
app.use(express.json())

app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.use('/api/auth', authRouter)
app.use('/api/user', userRoute)
app.use('/api/media', mediaRoute)
app.use('/api/tweet', tweetRoute)
app.use('/api/bookmark', bookmarkRoute)
app.use('/api/like', likeRoute)
app.use('/api/search', searchRoute)
app.use('/api/conversation', conversationRoute)
app.use('/static', staticRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))

app.use(defaultErrorHandler)

initSocket(httpServer)

httpServer.listen(envConfig.port, () => {
  console.log('Server listening on', envConfig.port)
})
