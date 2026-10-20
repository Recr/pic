export interface PayoutFilters {
  proposalId?: number
  re?: number
  employeeName?: string
  managerName?: string
  championName?: string
  description?: string
  dateFrom?: Date
  dateTo?: Date
  utcOffsetInMinutes?: number
  status?: string
  categoryId?: number
  areaId?: number
}
