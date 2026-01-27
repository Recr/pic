export interface Employee {
  re: number
  name: string
  role: string
  shift: string
}

export interface Proposal {
  id?: number
  description: string
  status: string
  createdAt?: Date
  employees: Employee[]
}

export interface CreateProposalRequest {
  description: string
  employeeRes: number[]
  areaId: number
}

export interface UpdateProposalRequest {
  id: string
  status?: "pending" | "approved" | "rejected" | "implemented"
  employees?: Employee[]
  area?: string
  suggestion?: string
}
