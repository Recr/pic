import express from 'express'
import { appRoutes } from './router'


const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Test')
})

app.use(express.json())
app.use('/api', appRoutes)


app.listen(port, () => {
  return console.log(`Server is running on port ${port}`)
})



