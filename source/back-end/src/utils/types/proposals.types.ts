export interface EmployeeInfo {
  re: number
  name: string
  shift: string
}
export interface CreateProposalInput {
  description: string
  areaId: number
  employees: EmployeeInfo[]
}

export interface CreateProposalWithSuggestions {
  description: string
  areaId: number
  employees: (EmployeeInfo & { id: number })[]
}

interface UpdateProposal {
  areaId: number
  categoryId: number
  isCustomReward: boolean
}

export interface UpdateProposalWithChampion extends UpdateProposal {
  championRe: number
  managerNotes?: string
}

export interface UpdateProposalWithManager extends UpdateProposal {
  managerRe: number
}

export interface UpdateProposalStatus {
  status: 'TO_IMPLEMENT' | 'REJECTED' | 'UNDER_VALIDATION' | 'NOT_VIABLE'
}

export interface UpdateProposalNotes {
  notes?: string
}
