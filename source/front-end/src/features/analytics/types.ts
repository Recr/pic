export interface GetTimeToCommunicationAndImplementationFilters {
  startDate?: string
  endDate?: string
}

export interface GetPendingAndCompletedPaymentsFilters {
  startDate?: string
  endDate?: string
}

export interface PendingAndCompletedPaymentsResponse {
  pendingPaymentsAmount: number
  pendingPaymentsCount: number
  completedPaymentsAmount: number
  completedPaymentsCount: number
}

export interface TimeToCommunicationAndImplementationResponse {
  averageTimeToCommunication: number
  averageTimeToImplementation: number
}
