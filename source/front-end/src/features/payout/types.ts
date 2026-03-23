export type PayoutStatus = 'PENDING' | 'PAID' | 'CANCELLED'

export interface Payout {
  id: number
  createdAt: string
  payedAt: string | null
  value: number
  status: PayoutStatus
  suggestion: {
    employeeRe: string
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
      completedAt: string | null
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
