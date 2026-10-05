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
      attachments: [
        {
          id: number
          storedName: string
          originalName: string
          sizeBytes: number
          uploadedAt: string
        },
      ]
    }
  }
}

export interface Pagination {
  limit: number
  offset: number
}

export interface GetPayoutsQueryParams extends Pagination {
  proposalId?: number
  re?: number
  employeeName?: string
  managerName?: string
  championName?: string
  description?: string
  dateFrom?: string
  dateTo?: string
  status?: string
  categoryId?: number
  areaId?: number
}

export interface GetPayoutsResponse {
  payouts: Payout[]
  totalCount: number
}

export interface UpdatePayoutStatusRequest {
  ids: number[]
  status: PayoutStatus
}

export interface UpdatePayoutStatusResponse {
  updatedCount: number
}
