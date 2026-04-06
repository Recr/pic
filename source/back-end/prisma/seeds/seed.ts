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
      mustChangePassword: false,
    },
  })

  // Create some additional employees as potential champions and managers
  const championsManagers = await prisma.employee.createMany({
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

  const categories = await prisma.category.createMany({
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

  // Fetch all areas and categories for random selection
  const areas = await prisma.area.findMany()
  const allCategories = await prisma.category.findMany()
  const employees = await prisma.employee.findMany({
    where: { role: { in: ['SUPERVISOR', 'MANAGER'] } },
  })

  // Generate 1000 proposals with dates spanning 2 years
  const proposals = generateProposals(1000, areas, allCategories, employees)

  console.log(`Seeding ${proposals.length} proposals...`)

  // Create proposals in batches to avoid timeout
  const batchSize = 100
  for (let i = 0; i < proposals.length; i += batchSize) {
    const batch = proposals.slice(i, i + batchSize)
    await prisma.proposal.createMany({ data: batch })
    console.log(`Created proposals ${i + 1} to ${Math.min(i + batchSize, proposals.length)}`)
  }

  console.log('Seeding completed!')
}

function generateProposals(
  count: number,
  areas: { id: number; name: string }[],
  categories: { id: number; categoryReward: { toString(): string } | null }[],
  employees: { id: number }[],
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

  for (let i = 0; i < count; i++) {
    // Generate random date within 2 years
    const randomTime = Math.random() * (now.getTime() - twoYearsAgo.getTime())
    const createdAt = new Date(twoYearsAgo.getTime() + randomTime)

    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const area = areas[Math.floor(Math.random() * areas.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const champion =
      employees.length > 0 ? employees[Math.floor(Math.random() * employees.length)] : null
    const manager =
      employees.length > 1 ? employees[Math.floor(Math.random() * employees.length)] : null

    // Get category reward or use a default
    let rewardAmount = null
    if (category.categoryReward !== null) {
      rewardAmount = Number(category.categoryReward.toString())
    }

    const proposal = {
      description: descriptions[Math.floor(Math.random() * descriptions.length)] + ` #${i + 1}`,
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
    }

    proposals.push(proposal)
  }

  return proposals
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
