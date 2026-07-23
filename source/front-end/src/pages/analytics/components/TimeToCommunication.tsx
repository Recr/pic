import { useMemo, useState } from 'react'
import { analyticsAPI } from '../../../features/analytics/analytics-api'
import type { GetTimeToCommunicationFilters } from '../../../features/analytics/types'

const TimeToCommunication: React.FC = () => {
  const [filterDateFromInput, setFilterDateFromInput] = useState('')
  const [filterDateToInput, setFilterDateToInput] = useState('')

  const activeFilters: GetTimeToCommunicationFilters = useMemo(() => {
    return {
      startDate: filterDateFromInput || undefined,
      endDate: filterDateToInput || undefined,
    }
  }, [filterDateFromInput, filterDateToInput])

  const { data: timeToCommunication } = analyticsAPI.useGetTimeToCommunicationQuery(activeFilters)

  console.log('timeToCommunication', timeToCommunication)

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Tempo de Comunicação</h1>
      <p className="text-gray-600">Esta página está em construção.</p>
      <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
        De
        <input
          type="date"
          value={filterDateFromInput}
          onChange={(event) => setFilterDateFromInput(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
        Até
        <input
          type="date"
          value={filterDateToInput}
          onChange={(event) => setFilterDateToInput(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </label>
      <p className="text-gray-600">
        {timeToCommunication
          ? `Tempo de Comunicação: ${timeToCommunication.averageTimeToCommunication}`
          : 'Nenhum dado disponível'}
      </p>
    </div>
  )
}

export default TimeToCommunication
