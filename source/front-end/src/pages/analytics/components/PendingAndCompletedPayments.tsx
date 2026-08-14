import { useMemo, useState } from 'react'
import type { GetPendingAndCompletedPaymentsFilters } from '../../../features/analytics/types'
import { analyticsAPI } from '../../../features/analytics/analytics-api'

const PendingAndCompletedPayments: React.FC = () => {
  const [filterDateFromInput, setFilterDateFromInput] = useState<string>(
    new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
  )
  const [filterDateToInput, setFilterDateToInput] = useState<string>(
    new Date().toISOString().split('T')[0],
  )

  const activeFilters: GetPendingAndCompletedPaymentsFilters = useMemo(() => {
    return {
      startDate: filterDateFromInput || undefined,
      endDate: filterDateToInput || undefined,
    }
  }, [filterDateFromInput, filterDateToInput])

  const { data: pendingAndCompletedPayments } =
    analyticsAPI.useGetPendingAndCompletedPaymentsQuery(activeFilters)

  return (
    <div className="h-full w-full">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pagamentos Pendentes e Concluídos
            </h2>
            <p className="mt-1 text-sm text-gray-500">Calculados para o período selecionado.</p>
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

        {pendingAndCompletedPayments ? (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
              <p className="text-sm font-medium text-green-700">Total de Pagamentos Concluídos</p>
              <p className="mt-3 text-5xl font-bold text-green-600">
                R$ {pendingAndCompletedPayments.completedPaymentsAmount}
              </p>
              <p className="mt-1 text-sm text-green-700">
                {pendingAndCompletedPayments.completedPaymentsCount} pagamentos individuais
              </p>
            </div>

            <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-6 text-center">
              <p className="text-sm font-medium text-yellow-700">Total de Pagamentos Pendentes</p>
              <p className="mt-3 text-5xl font-bold text-yellow-600">
                R$ {pendingAndCompletedPayments.pendingPaymentsAmount}
              </p>
              <p className="mt-1 text-sm text-yellow-700">
                {pendingAndCompletedPayments.pendingPaymentsCount} pagamentos individuais
              </p>
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

export default PendingAndCompletedPayments
