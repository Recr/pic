import type { Employee } from '../employee/types'

export type PayoutStatus = 'PENDING' | 'PAID' | 'CANCELLED'

export interface Payout {
  id: number
  createdAt: string
  payedAt: string | null
  value: number
  status: PayoutStatus
  suggestion: {
    employeeRe: number
    employeeName: string
    employeeShift: string
    employee: {
      re: number
      name: string
      shift: string
      role: string
    }
    proposal: {
      id: number
      description: string
      createdAt: string
      rewardAmount: number
      completedAt: string
      isLegacy: boolean
      manager: Employee | null
      champion: Employee | null
      status: string
      requiresImplementation: boolean
      area: {
        name: string
      }
      category: {
        name: string
        categoryReward: number
      }
    }
  }
}

export interface UpdatePayoutStatusRequest {
  ids: number[]
  status: PayoutStatus
}

export interface UpdatePayoutStatusResponse {
  updatedCount: number
}
