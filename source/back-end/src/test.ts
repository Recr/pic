import { prisma } from './lib/prisma'

async function main() {
  // Create a new area with a post
  const area = await prisma.area.create({
    data: {
      name: 'Alice',
    },
  })
  console.log('Created area:', area)

  // Fetch all areas with their posts
  const allareas = await prisma.area.findMany()
  console.log('All areas:', JSON.stringify(allareas, null, 2))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
