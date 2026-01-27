import { prisma } from "../lib/prisma";
import { CreateProposalWithSuggestions } from "../utils/types/proposals.types";

class PrismaProposalRepository {
  public async findAll() {
    const proposals = await prisma.proposal.findMany();
    return proposals;
  }

  public async findAllWithEmployees() {
    const proposals = await prisma.proposal.findMany({
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        suggestions: {
          select: {
            id: false,
            employeeId: false,
            proposalId: false,
            employee: {
              select: {
                re: true,
                name: true,
                role: true,
                shift: true,
              },
            },
          },
        },
      },
    });
    return proposals;
  }

  public async findById(proposalId: number) {
    const proposal = await prisma.proposal.findUnique({
      where: {
        id: proposalId,
      },
    });
    return proposal;
  }

  public async createWithSuggestions({
    employeeIds,
    ...newProposal
  }: CreateProposalWithSuggestions) {
    const proposal = await prisma.proposal.create({
      data: {
        ...newProposal,
        suggestions: {
          createMany: {
            data: employeeIds.map((id) => ({
              employeeId: id,
            })),
          },
        },
      },
    });
    return proposal;
  }
}

export { PrismaProposalRepository };
