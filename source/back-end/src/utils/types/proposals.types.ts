export interface CreateProposal {
  description: string
  categoryId: number
  rewardAmount: number
  areaId: number
  createdAt: Date
}

export interface CreateProposalInput extends CreateProposal {
  employeeRes: number[]
}

export interface CreateProposalWithSuggestions extends CreateProposal {
  employeeIds: number[]
}