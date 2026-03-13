interface EmployeeInput {
  re: number
  name: string
  shift: string
}

export interface Employee {
  re: number
  name: string
  role: string
  shift: string
}

export interface Proposal {
  id: number
  description: string
  status: string
  createdAt: Date
  employees: Employee[]
}

export interface ProposalWithSuggestions {
  id: number
  description: string
  status: string
  createdAt: Date
  suggestions: [
    {
      employeeName: string
      employeeRe: number
      employeeShift?: string
      employee?: Employee
    },
  ]
  area: {
    id: number
    name: string
  }
  category: {
    id: number
    name: string
    categoryReward: number
  }
}

export interface CreateProposalRequest {
  description: string
  employees: EmployeeInput[]
  areaId: number
}

export interface UpdateProposalRequest {
  championRe: number
  areaId: number
  categoryId: number
}
