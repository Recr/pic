import express from 'express'
import { appRoutes } from './router'
import cors, { CorsOptions } from 'cors'

const app = express()
const port = 3000

const corsOptions: CorsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
}

app.get('/', (req, res) => {
  res.send('Test')
})

app.use(express.json())
app.use(cors(corsOptions))
app.use('/api', appRoutes)

app.listen(port, () => {
  return console.log(`Server is running on port ${port}`)
})
