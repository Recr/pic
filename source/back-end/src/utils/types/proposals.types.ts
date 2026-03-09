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

export interface UpdateProposalWithChampion {
  championRe: number
  areaId: number
  categoryId: number
}
