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
  managerNotes?: string | null
  isCustomReward: boolean
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

export interface ProposalAttachment {
  id: number
  storedName: string
  originalName: string
  sizeBytes: number
  uploadedAt: Date
}

export interface ProposalDetailed {
  id: number
  description: string
  status: string
  createdAt: Date
  adminReviewedAt: Date
  championReviewedAt: Date
  implementationStartedAt: Date
  completedAt: Date
  notes: string | null
  rejectionNote: string | null
  rewardAmount: number | null
  isCustomReward: boolean
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
  champion: Employee | null
  manager: Employee | null
  attachments: ProposalAttachment[]
}

export interface CreateProposalRequest {
  description: string
  employees: EmployeeInput[]
  areaId: number
}

export interface UpdateProposalWithManagerRequest {
  managerRe: number
  areaId: number
  categoryId: number
}

export interface UpdateProposalWithChampionRequest {
  championRe: number
  managerNotes?: string
}

export interface AdminUpdateProposalWithChampionRequest extends UpdateProposalWithChampionRequest {
  areaId: number
  categoryId: number
}

export interface FinishProposalRequest {
  status: string
  customRewardAmount?: number
}
