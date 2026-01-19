import 'dotenv/config'
import { PrismaMssql } from '@prisma/adapter-mssql'
import { PrismaClient } from '../../prisma/client/client'

const connectionString = `${process.env.DATABASE_URL}`

const omitConfig = {
  employee: {
    passwordHash: true,
  },
} as const

const adapter = new PrismaMssql(connectionString)
const prisma = new PrismaClient({ adapter, omit: omitConfig })

export { prisma }