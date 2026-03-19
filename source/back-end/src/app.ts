import express from 'express'
import { appRoutes } from './router'
import cors, { CorsOptions } from 'cors'
import cookieParser from 'cookie-parser'

const app = express()
const port = process.env.PORT || 3030
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'

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

app.listen(port, () => {
  return console.log(`Server is running on port ${port}`)
})
