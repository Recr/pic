import { prisma } from '../lib/prisma'

class RefreshTokenRepository {
  public async create(tokenHash: string, employeeId: number, expiresAt: Date) {
    const refreshTokenRecord = await prisma.refreshToken.create({
      data: {
        tokenHash,
        employeeId,
        expiresAt,
      },
    })
    return refreshTokenRecord
  }
}

export { RefreshTokenRepository }
