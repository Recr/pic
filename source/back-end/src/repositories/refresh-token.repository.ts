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

  public async update(id: number, tokenHash: string, expiresAt: Date) {
    const updatedToken = await prisma.refreshToken.update({
      where: { id },
      data: { tokenHash, expiresAt },
    })
    return updatedToken
  }

  public async findByEmployeeId(employeeId: number) {
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: { employeeId },
    })
    return tokenRecord
  }
}

export { RefreshTokenRepository }
