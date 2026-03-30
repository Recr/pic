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
}

export interface UpdateProposalWithChampion extends UpdateProposal {
  championRe: number
}

export interface UpdateProposalWithManager extends UpdateProposal {
  managerRe: number
}

export interface UpdateProposalStatus {
  status: 'TO_IMPLEMENT' | 'REJECTED' | 'UNDER_VALIDATION' | 'NOT_VIABLE'
}
