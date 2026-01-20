import { StatusCodes } from "http-status-codes";
import { AppError } from "../errors/AppError";
import { PrismaProposalRepository } from "../repositories/proposal.repository";
import { CreateProposalInput } from "../utils/types/proposals.types";
import { PrismaEmployeeRepository } from "../repositories/employee.repository";

class ProposalsUseCase {
  constructor(
    private proposalRepository: PrismaProposalRepository,
    private employeeRepository: PrismaEmployeeRepository
  ){}

  public async executeFindAll() {
    const proposals = this.proposalRepository.findAll()
    return proposals
  }

  public async executeFindById(proposalId: number) {
    const proposal = this.proposalRepository.findById(proposalId)
    if (!proposal) throw new AppError("Proposal not found", StatusCodes.NOT_FOUND)
    return proposal
  }

  public async executeCreate(newProposal: CreateProposalInput) {
    const proposal = this.proposalRepository.createWithSuggestions(newProposal)
    return proposal
  }
}

export { ProposalsUseCase }