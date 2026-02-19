import { PrismaClient } from '../client/client'
import { PrismaMssql } from '@prisma/adapter-mssql'
import 'dotenv/config'
import bcrypt from 'bcrypt'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaMssql(connectionString)
const prisma = new PrismaClient({ adapter })

const passwordHash = await bcrypt.hash('admin', 10)

async function main() {
  await prisma.employee.create({
    data: {
      re: 1,
      name: 'Admin',
      passwordHash,
      role: 'ADMIN',
    },
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
