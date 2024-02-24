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

config()

databaseService.connect()

const app = express()
const port = process.env.PORT

//create folder uploads
initFolder()

//parse json data
app.use(express.json())

app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.use('/api/auth', authRouter)
app.use('/api/user', userRoute)
app.use('/api/media', mediaRoute)
app.use('/static', staticRouter)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
