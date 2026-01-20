import { prisma } from "../lib/prisma";
import { CreateProposalWithSuggestions } from "../utils/types/proposals.types";

class PrismaProposalRepository {
  public async findAll() {
    const proposals = await prisma.proposal.findMany()
    return proposals 
  }

  public async findById(proposalId: number) {
    const proposal = await prisma.proposal.findUnique({
      where: {
        id: proposalId
      }
    })
    return proposal
  }

  public async createWithSuggestions({ employeeIds, ...newProposal }: CreateProposalWithSuggestions) {
    const proposal = await prisma.proposal.create({
      data: {
        ...newProposal,
        suggestions: {
          createMany: {
            data: employeeIds.map(id => ({
              employeeId: id
            }))
          }
        }
      }
    })
    return proposal
  }
}

export { PrismaProposalRepository }