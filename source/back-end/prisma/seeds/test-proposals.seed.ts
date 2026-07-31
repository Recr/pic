import { PrismaClient } from '../client/client'
import { PrismaMssql } from '@prisma/adapter-mssql'
import 'dotenv/config'
import bcrypt from 'bcrypt'
import { fileURLToPath } from 'node:url'

interface Area {
  id: number
  name: string
}

interface Category {
  id: number
  categoryReward: { toString(): string } | null
}

interface Employee {
  id: number
}

export async function seedTestProposals() {
  const connectionString = `${process.env.DATABASE_URL}`
  const adapter = new PrismaMssql(connectionString)
  const prisma = new PrismaClient({ adapter })
  const passwordHash = await bcrypt.hash('admin', 10)

  try {
    await prisma.employee.createMany({
      data: [
        {
          re: 10284,
          name: 'João Silva',
          passwordHash,
          role: 'SUPERVISOR',
          shift: 'MORNING',
          mustChangePassword: false,
        },
        {
          re: 10285,
          name: 'Maria Santos',
          passwordHash,
          role: 'SUPERVISOR',
          shift: 'AFTERNOON',
          mustChangePassword: false,
        },
        {
          re: 10286,
          name: 'Pedro Oliveira',
          passwordHash,
          role: 'MANAGER',
          shift: 'MORNING',
          mustChangePassword: false,
        },
        {
          re: 10287,
          name: 'Ana Costa',
          passwordHash,
          role: 'MANAGER',
          shift: 'AFTERNOON',
          mustChangePassword: false,
        },
        {
          re: 10288,
          name: 'Carlos Ferreira',
          passwordHash,
          role: 'SUPERVISOR',
          shift: 'NIGHT',
          mustChangePassword: false,
        },
      ],
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
        { name: 'Redução de Custo', categoryReward: 0.0 },
      ],
    })

    const areas = await prisma.area.findMany()
    const categories = await prisma.category.findMany()
    const employees = await prisma.employee.findMany({
      where: { role: { in: ['SUPERVISOR', 'MANAGER'] } },
    })

    const proposals = generateProposals(1000, areas, categories, employees)

    console.log(`Seeding ${proposals.length} proposals...`)

    const batchSize = 100
    for (let index = 0; index < proposals.length; index += batchSize) {
      const batch = proposals.slice(index, index + batchSize)
      await prisma.proposal.createMany({ data: batch })
      console.log(
        `Created proposals ${index + 1} to ${Math.min(index + batchSize, proposals.length)}`,
      )
    }

    console.log('Test proposals seeded successfully')
  } finally {
    await prisma.$disconnect()
  }
}

function generateProposals(
  count: number,
  areas: Area[],
  categories: Category[],
  employees: Employee[],
) {
  const proposals = []
  const statuses = [
    'DEFINE_CHAMPION',
    'UNDER_VALIDATION',
    'TO_IMPLEMENT',
    'IMPLEMENTATION',
    'REJECTED',
    'NOT_VIABLE',
    'IMPLEMENTED',
  ]
  const descriptions = [
    'Melhoria no processo de montagem',
    'Redução de tempo de produção',
    'Aumento de segurança no setor',
    'Otimização de recursos',
    'Implementação de nova ferramenta',
    'Reorganização do layout',
    'Treinamento de equipe',
    'Automação de processos',
    'Redução de defeitos',
    'Melhoria na qualidade',
    'Aumento de produtividade',
    'Redução de custos operacionais',
    'Implementação de 5S',
    'Correção ergonômica',
    'Melhor gestão de estoque',
  ]

  const now = new Date()
  const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000)

  for (let index = 0; index < count; index++) {
    const randomTime = Math.random() * (now.getTime() - twoYearsAgo.getTime())
    const createdAt = new Date(twoYearsAgo.getTime() + randomTime)

    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const area = areas[Math.floor(Math.random() * areas.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const champion =
      employees.length > 0 ? employees[Math.floor(Math.random() * employees.length)] : null
    const manager =
      employees.length > 1 ? employees[Math.floor(Math.random() * employees.length)] : null

    let rewardAmount = null
    if (category.categoryReward !== null) {
      rewardAmount = Number(category.categoryReward.toString())
    }

    proposals.push({
      description: `${descriptions[Math.floor(Math.random() * descriptions.length)]} #${index + 1}`,
      status,
      categoryId: category.id,
      rewardAmount,
      areaId: area.id,
      createdAt,
      championId: champion?.id ?? null,
      managerId: manager?.id ?? null,
      adminReviewedAt:
        status !== 'DEFINE_CHAMPION' ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) : null,
      managerReviewedAt: [
        'UNDER_VALIDATION',
        'TO_IMPLEMENT',
        'IMPLEMENTATION',
        'IMPLEMENTED',
      ].includes(status)
        ? new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000)
        : null,
      championReviewedAt: ['IMPLEMENTATION', 'IMPLEMENTED'].includes(status)
        ? new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000)
        : null,
      implementationStartedAt: ['IMPLEMENTATION', 'IMPLEMENTED'].includes(status)
        ? new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000)
        : null,
      completedAt:
        status === 'IMPLEMENTED' ? new Date(createdAt.getTime() + 15 * 24 * 60 * 60 * 1000) : null,
      notes: Math.random() > 0.7 ? 'Nota importante sobre a proposta' : null,
      managerNotes: Math.random() > 0.8 ? 'Avaliação do gerente' : null,
      rejectionNote:
        status === 'REJECTED' ? 'Proposta não foi aprovada por falta de recursos' : null,
      isCustomReward: Math.random() > 0.9,
    })
  }

  return proposals
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  seedTestProposals().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
