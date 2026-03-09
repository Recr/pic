export interface CreateProposal {
  description: string
  rewardAmount: number
  areaId: number
}

export interface CreateProposalInput extends CreateProposal {
  employeeRes: number[]
}

export interface CreateProposalWithSuggestions extends CreateProposal {
  employeeIds: number[]
  employeeRes: number[]
}

export interface UpdateProposalWithChampion {
  championRe: number
  areaId: number
  categoryId: number
}
