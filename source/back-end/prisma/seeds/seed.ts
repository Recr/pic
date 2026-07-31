import { seedAdmin } from './admin.seed'
import { seedTestProposals } from './test-proposals.seed'

async function main() {
  await seedAdmin()
  await seedTestProposals()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
