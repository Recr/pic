import { useMemo, useState } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { analyticsAPI } from '../../features/analytics/analytics-api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const STATUS_OPTIONS = [
  'DEFINE_CHAMPION',
  'UNDER_VALIDATION',
  'TO_IMPLEMENT',
  'IMPLEMENTATION',
  'IMPLEMENTED',
  'REJECTED',
  'NOT_VIABLE',
]

const currentYear = new Date().getFullYear()
const DEFAULT_START_DATE = `${currentYear}-01-01`
const DEFAULT_END_DATE = `${currentYear}-12-31`

const AnalyticsPage: React.FC = () => {
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE)
  const [endDate, setEndDate] = useState(DEFAULT_END_DATE)

  const filters = useMemo(
    () => ({
      ...(status ? { status } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    }),
    [status, startDate, endDate],
  )

  const { data: proposalAnalytics, isLoading } = analyticsAPI.useGetProposalAnalyticsQuery(filters)

  return (
    <div className="bg-gray-100 pt-8 min-h-screen">
      <div className="p-4 w-2xl mx-auto bg-white rounded">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Métrica e KPIs do PIC.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="analytics-status-filter">
              Status
            </label>
            <select
              id="analytics-status-filter"
              className="w-full rounded border px-3 py-2"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Tudo</option>
              {STATUS_OPTIONS.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="analytics-start-date-filter">
              Data de início
            </label>
            <input
              id="analytics-start-date-filter"
              className="w-full rounded border px-3 py-2"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="analytics-end-date-filter">
              Data final
            </label>
            <input
              id="analytics-end-date-filter"
              className="w-full rounded border px-3 py-2"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          {isLoading
            ? 'Loading proposals...'
            : `${proposalAnalytics?.totalProposals ?? 0} propostas encontrados com os filtros atuais.`}
        </p>
        <Line
          data={{
            labels: proposalAnalytics?.labels || [],
            datasets: [
              {
                label: 'Propostas',
                data: proposalAnalytics?.data || [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Propostas Submetidas',
              },
            },
            animations: {
              tension: {
                duration: 1000,
              },
            },
          }}
        />
      </div>
    </div>
  )
}

export default AnalyticsPage
