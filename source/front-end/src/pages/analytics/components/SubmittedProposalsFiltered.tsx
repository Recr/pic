import { Line } from 'react-chartjs-2'
import { analyticsAPI } from '../../../features/analytics/analytics-api'
import { useMemo, useState } from 'react'
import { categoryAPI } from '../../../features/category/category-api'
import { areaAPI } from '../../../features/area/area-api'
import DropdownSelect from '../../../components/DropdownSelect'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

const currentYear = new Date().getFullYear()
const DEFAULT_START_DATE = `${currentYear}-01-01`
const DEFAULT_END_DATE = `${currentYear}-12-31`

const STATUS_OPTIONS = [
  { value: 'DEFINE_CHAMPION', label: 'Definir Executor' },
  { value: 'UNDER_VALIDATION', label: 'Em validação' },
  { value: 'TO_IMPLEMENT', label: 'Para implementar' },
  { value: 'IMPLEMENTATION', label: 'Em implementação' },
  { value: 'IMPLEMENTED', label: 'Implementada' },
  { value: 'REJECTED', label: 'Rejeitada' },
  { value: 'NOT_VIABLE', label: 'Inviável' },
]

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
)

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
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <DropdownSelect
          id="analytics-status-filter"
          label="Status"
          value={status}
          onChange={setStatus}
          placeholder="Tudo"
          options={STATUS_OPTIONS}
        />
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
        <DropdownSelect
          id="analytics-category-filter"
          label="Categoria"
          value={categoryId}
          onChange={setCategoryId}
          placeholder="Tudo"
          options={
            categoryList?.map((categoryOption) => ({
              value: String(categoryOption.id),
              label: categoryOption.name,
            })) ?? []
          }
        />
        <DropdownSelect
          id="analytics-area-filter"
          label="Area"
          value={areaId}
          onChange={setAreaId}
          placeholder="Tudo"
          options={
            areaList?.map((areaOption) => ({
              value: String(areaOption.id),
              label: areaOption.name,
            })) ?? []
          }
        />
      </div>
      <p className="mt-3 text-sm text-gray-600">
        {isLoading
          ? 'Loading proposals...'
          : `${proposalAnalytics?.totalProposals ?? 0} propostas encontrados com os filtros atuais.`}
      </p>
      <div className="mt-4 h-64 w-full sm:h-80">
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
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              datalabels: {
                display: true,
                align: 'top',
                font: {
                  size: 10,
                },
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

export default SubmittedProposalsFiltered
