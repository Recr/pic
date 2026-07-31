import { PrismaClient } from '../client/client'
import { PrismaMssql } from '@prisma/adapter-mssql'
import 'dotenv/config'
import bcrypt from 'bcrypt'
import { fileURLToPath } from 'node:url'

export async function seedAdmin() {
  const connectionString = `${process.env.DATABASE_URL}`
  const adapter = new PrismaMssql(connectionString)
  const prisma = new PrismaClient({ adapter })
  const passwordHash = await bcrypt.hash('admin', 10)

  try {
    await prisma.employee.create({
      data: {
        re: 10283,
        name: 'Eliel da Silva',
        passwordHash,
        role: 'ADMIN',
        shift: 'ADM',
        mustChangePassword: false,
      },
    })

    console.log('Admin user seeded successfully')
  } finally {
    await prisma.$disconnect()
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  seedAdmin().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
