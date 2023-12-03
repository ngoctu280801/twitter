import express from 'express'
import authRouter from './routes/auth.routes'
import userRoute from './routes/user.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middleware'
databaseService.connect()

const app = express()
const port = 3000
//parse json data
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/user', userRoute)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
