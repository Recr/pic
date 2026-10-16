import { vi } from 'vitest'

export interface ProposalRepositoryMock {
  findAllFiltered: ReturnType<typeof vi.fn>
  findAllWithEmployees: ReturnType<typeof vi.fn>
  findAllDetailed: ReturnType<typeof vi.fn>
}

export const makeProposalRepositoryMock = (): ProposalRepositoryMock => ({
  findAllFiltered: vi.fn(),
  findAllWithEmployees: vi.fn(),
  findAllDetailed: vi.fn(),
})
