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
      re: 10283,
      name: 'Eliel da Silva',
      passwordHash,
      role: 'ADMIN',
      shift: 'ADM',
      isFirstAccess: false,
    },
  })

  await prisma.area.createMany({
    data: [
      { name: 'Mezanino' },
      { name: 'Metalização' },
      { name: 'Montagem' },
      { name: 'Cabine Pintura' },
      { name: 'Expedição' },
      { name: 'Montagem Small' },
      { name: 'Injeção' },
      { name: 'Área Externa' },
    ],
  })

  await prisma.category.createMany({
    data: [
      { name: 'Segurança e Ergonomia', categoryReward: 45.0 },
      { name: 'Qualidade', categoryReward: 45.0 },
      { name: 'Produtividade', categoryReward: 45.0 },
      { name: '5S', categoryReward: 22.5 },
      { name: 'Esperas', categoryReward: 15.0 },
      { name: 'Processo inadequado ou desnecessário', categoryReward: 15.0 },
      { name: 'Identificação e correção de documentos', categoryReward: 7.5 },
    ],
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
