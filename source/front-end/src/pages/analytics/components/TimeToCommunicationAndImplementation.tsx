import { useMemo, useState } from 'react'
import { analyticsAPI } from '../../../features/analytics/analytics-api'
import type { GetTimeToCommunicationAndImplementationFilters } from '../../../features/analytics/types'

const TimeToCommunicationAndImplementation: React.FC = () => {
  const [filterDateFromInput, setFilterDateFromInput] = useState<string>(
    new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
  )
  const [filterDateToInput, setFilterDateToInput] = useState<string>(
    new Date().toISOString().split('T')[0],
  )

  const activeFilters: GetTimeToCommunicationAndImplementationFilters = useMemo(() => {
    return {
      startDate: filterDateFromInput || undefined,
      endDate: filterDateToInput || undefined,
    }
  }, [filterDateFromInput, filterDateToInput])

  const { data: timeToCommunicationAndImplementation } =
    analyticsAPI.useGetTimeToCommunicationAndImplementationQuery(activeFilters)

  console.log('timeToCommunicationAndImplementation', timeToCommunicationAndImplementation)

  return (
    <div className="h-full w-full">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Tempo de Processamento</h2>
            <p className="mt-1 text-sm text-gray-500">
              Médias calculadas para o período selecionado.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">De</span>
            <input
              type="date"
              value={filterDateFromInput}
              onChange={(e) => setFilterDateFromInput(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">Até</span>
            <input
              type="date"
              value={filterDateToInput}
              onChange={(e) => setFilterDateToInput(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </label>
        </div>

        {timeToCommunicationAndImplementation ? (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
              <p className="text-sm font-medium text-blue-700">Tempo médio de comunicação</p>

              <p className="mt-3 text-5xl font-bold text-blue-600">
                {timeToCommunicationAndImplementation.averageTimeToCommunication}
              </p>

              <p className="mt-1 text-sm text-blue-700">dias</p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 text-center">
              <p className="text-sm font-medium text-emerald-700">Tempo médio de implementação</p>

              <p className="mt-3 text-5xl font-bold text-emerald-600">
                {timeToCommunicationAndImplementation.averageTimeToImplementation}
              </p>

              <p className="mt-1 text-sm text-emerald-700">dias</p>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
            Nenhum dado disponível para o período selecionado.
          </div>
        )}
      </div>
    </div>
  )
}

export default TimeToCommunicationAndImplementation
