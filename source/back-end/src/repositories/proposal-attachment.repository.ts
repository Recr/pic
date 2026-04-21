import path from 'node:path'
import { prisma } from '../lib/prisma'

class PrismaProposalAttachmentRepository {
  async create(file: Express.Multer.File, proposalId: number) {
    const proposalAttachments = await prisma.proposalAttachment.create({
      data: {
        proposalId,
        relativePath: file.filename,
        storedName: file.filename,
        originalName: file.originalname,
        sizeBytes: file.size,
      },
    })

    return proposalAttachments
  }

  async findById(id: number) {
    return await prisma.proposalAttachment.findUnique({
      where: { id },
    })
  }

  async deleteById(id: number) {
    return await prisma.proposalAttachment.delete({
      where: { id },
    })
  }
}

export { PrismaProposalAttachmentRepository }
