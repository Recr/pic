import { prisma } from '../lib/prisma'

class PrismaRefreshTokenRepository {
  public async create(tokenHash: string, employeeId: number, expiresAt: Date) {
    prisma.$transaction(async (tx) => {
      await tx.refreshToken.updateMany({
        where: { employeeId, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      return tx.refreshToken.create({
        data: {
          tokenHash,
          employeeId,
          expiresAt,
        },
      })
    })
  }

  public async update(id: number, tokenHash: string, expiresAt: Date) {
    const updatedToken = await prisma.refreshToken.update({
      where: { id },
      data: { tokenHash, expiresAt },
    })
    return updatedToken
  }

  public async findByEmployeeId(employeeId: number) {
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        employeeId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return tokenRecord
  }

  public async findByTokenHash(tokenHash: string) {
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: { tokenHash },
    })
    return tokenRecord
  }

  public async rotate(
    currentTokenId: number,
    newTokenHash: string,
    employeeId: number,
    expiresAt: Date,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: currentTokenId },
        data: { revokedAt: new Date() },
      })

      return tx.refreshToken.create({
        data: {
          tokenHash: newTokenHash,
          employeeId,
          expiresAt,
        },
      })
    })
  }

  public async revokeByEmployeeId(employeeId: number) {
    await prisma.refreshToken.updateMany({
      where: { employeeId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }
}

export { PrismaRefreshTokenRepository }
