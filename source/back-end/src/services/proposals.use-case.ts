import { StatusCodes } from "http-status-codes";
import { AppError } from "../errors/AppError";
import { PrismaProposalRepository } from "../repositories/proposal.repository";
import {
  CreateProposalInput,
  CreateProposalWithSuggestions,
} from "../utils/types/proposals.types";
import { PrismaEmployeeRepository } from "../repositories/employee.repository";

class ProposalsUseCase {
  constructor(
    private proposalRepository: PrismaProposalRepository,
    private employeeRepository: PrismaEmployeeRepository,
  ) {}

  public async executeFindAll() {
    const proposals = await this.proposalRepository.findAll();
    return proposals;
  }

  public async executeFindAllWithEmployees() {
    const proposals = await this.proposalRepository.findAllWithEmployees();
    const formatedProposals = proposals.map(({ suggestions, ...proposal }) => ({
      ...proposal,
      employees: suggestions.map((s) => s.employee),
    }));
    return formatedProposals;
  }

  public async executeFindById(proposalId: number) {
    const proposal = await this.proposalRepository.findById(proposalId);
    if (!proposal)
      throw new AppError("Proposal not found", StatusCodes.NOT_FOUND);
    return proposal;
  }

  public async executeCreate({
    employeeRes,
    ...newProposal
  }: CreateProposalInput) {
    const employeeIds: number[] = (
      await this.employeeRepository.findManyByRe(employeeRes)
    ).map((employee) => employee.id);
    if (employeeIds.length !== employeeRes.length)
      throw new AppError("Employees not found", StatusCodes.NOT_FOUND);
    const newProposalWithIds: CreateProposalWithSuggestions = {
      ...newProposal,
      employeeIds,
    };
    const proposal =
      await this.proposalRepository.createWithSuggestions(newProposalWithIds);
    return proposal;
  }
}

export { ProposalsUseCase };
