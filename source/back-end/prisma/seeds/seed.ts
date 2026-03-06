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
      { name: 'Segurança e Ergonomia' },
      { name: 'Qualidade' },
      { name: 'Produtividade' },
      { name: '5S' },
      { name: 'Esperas' },
      { name: 'Processo desnecessário ou inadequado' },
      { name: 'Identificação e correção de documentos' },
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
