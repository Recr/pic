export interface GetTimeToCommunicationAndImplementationFilters {
  startDate?: string
  endDate?: string
}

export interface TimeToCommunicationAndImplementationResponse {
  averageTimeToCommunication: number
  averageTimeToImplementation: number
}
