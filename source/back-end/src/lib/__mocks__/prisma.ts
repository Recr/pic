import { beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import type { PrismaClient } from '../../../prisma/client/client'

beforeEach(() => {
  mockReset(prisma)
})

const prisma = mockDeep<PrismaClient>()

export { prisma }
export default prisma
