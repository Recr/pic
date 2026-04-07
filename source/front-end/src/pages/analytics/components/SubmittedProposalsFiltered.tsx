import { Line } from 'react-chartjs-2'
import { analyticsAPI } from '../../../features/analytics/analytics-api'
import { useMemo, useState } from 'react'
import { categoryAPI } from '../../../features/category/category-api'
import { areaAPI } from '../../../features/area/area-api'

const currentYear = new Date().getFullYear()
const DEFAULT_START_DATE = `${currentYear}-01-01`
const DEFAULT_END_DATE = `${currentYear}-12-31`

const STATUS_OPTIONS = [
  'DEFINE_CHAMPION',
  'UNDER_VALIDATION',
  'TO_IMPLEMENT',
  'IMPLEMENTATION',
  'IMPLEMENTED',
  'REJECTED',
  'NOT_VIABLE',
]

const SubmittedProposalsFiltered: React.FC = () => {
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE)
  const [endDate, setEndDate] = useState(DEFAULT_END_DATE)
  const [categoryId, setCategoryId] = useState('')
  const [areaId, setAreaId] = useState('')

  const filters = useMemo(
    () => ({
      ...(status ? { status } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(categoryId ? { categoryId: Number(categoryId) } : {}),
      ...(areaId ? { areaId: Number(areaId) } : {}),
    }),
    [status, startDate, endDate, categoryId, areaId],
  )

  const { data: proposalAnalytics, isLoading } = analyticsAPI.useGetProposalAnalyticsQuery(filters)
  const { data: categoryList } = categoryAPI.useGetCategoriesQuery()
  const { data: areaList } = areaAPI.useGetAreasQuery()
  return (
    <div>
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
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="analytics-category-filter">
            Categoria
          </label>
          <select
            id="analytics-category-filter"
            className="w-full rounded border px-3 py-2"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">Tudo</option>
            {categoryList?.map((categoryOption) => (
              <option key={categoryOption.id} value={categoryOption.id}>
                {categoryOption.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="analytics-area-filter">
            Area
          </label>
          <select
            id="analytics-area-filter"
            className="w-full rounded border px-3 py-2"
            value={areaId}
            onChange={(event) => setAreaId(event.target.value)}
          >
            <option value="">Tudo</option>
            {areaList?.map((areaOption) => (
              <option key={areaOption.id} value={areaOption.id}>
                {areaOption.name}
              </option>
            ))}
          </select>
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
  )
}

export default SubmittedProposalsFiltered
