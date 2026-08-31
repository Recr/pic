import express from 'express'
import { appRoutes } from './router'
import cors, { CorsOptions } from 'cors'
import cookieParser from 'cookie-parser'
import { startEmailJob } from './jobs/email-job'
import dotenv from 'dotenv'

dotenv.config()

const app = express().disable('x-powered-by')
const port = process.env.PORT
const corsOrigin = `${process.env.CORS_ORIGIN}`

const corsOptions: CorsOptions = {
  origin: corsOrigin,
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
app.use(cookieParser())
app.use('/api', appRoutes)

startEmailJob()

app.listen(port, () => {
  return console.log(`Server is running on port ${port}`)
})
