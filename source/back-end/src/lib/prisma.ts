import 'dotenv/config'
import { PrismaMssql } from '@prisma/adapter-mssql'
import { PrismaClient } from '../../prisma/client/client'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaMssql(connectionString)
const prisma = new PrismaClient({ adapter })

export { prisma }