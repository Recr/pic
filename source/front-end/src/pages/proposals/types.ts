import type { Employee } from '../../features/proposal/types'

export type ProposalStatus =
  | 'UNDER_VALIDATION'
  | 'TO_IMPLEMENT'
  | 'IMPLEMENTATION'
  | 'WAITING_APPROVAL'

export interface ProposalWithSuggestions {
  id: number
  description: string
  status: ProposalStatus
  createdAt: Date
  notes?: string | null
  managerNotes?: string | null
  isCustomReward: boolean
  rewardAmount: number
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
