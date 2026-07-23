import { useState } from 'react'
import { analyticsAPI } from '../../../features/analytics/analytics-api'

const TimeToCommunication: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear())
  const [timeToCommunication] = analyticsAPI.useGetProposalAnalyticsQuery({ year })
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Tempo de Comunicação</h1>
      <p className="text-gray-600">Esta página está em construção.</p>
    </div>
  )
}

export default TimeToCommunication
