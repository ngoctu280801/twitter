import express from 'express'
import authRouter from './routes/auth.routes'
import databaseService from './services/database.services'

const app = express()
const port = 3000
//parse json data
app.use(express.json())

app.use('/api/auth', authRouter)

databaseService.connect()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
