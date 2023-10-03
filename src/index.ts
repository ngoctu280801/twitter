import express from 'express'

const app = express()
const port = 3000
const router = express.Router()

app.get('/', (req, res) => {
  res.send('Hello world')
})
router.use((req, res, next) => {
  console.log(Date.now())
  next()
})
router.get('/tweets', (req, res) => {
  res.json({ message: 'Hom nay an gi' })
})
app.use('/api', router)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
