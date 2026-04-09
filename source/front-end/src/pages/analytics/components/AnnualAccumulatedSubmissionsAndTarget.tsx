import { Chart as ReactChart } from 'react-chartjs-2'
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
import type { ChartDataset } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { analyticsAPI } from '../../../features/analytics/analytics-api'
import { useMemo, useState } from 'react'
import { annualTargetAPI } from '../../../features/annual-target/annual-target-api'
import { Circle, X } from 'lucide-react'

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth()

type MixedChartType = 'bar' | 'line'

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

const AnnualAccumulatedSubmissionsAndTarget: React.FC = () => {
  const [year, setYear] = useState(currentYear)
  const [startDate, setStartDate] = useState<string>(`${year}-01-01`)
  const [endDate, setEndDate] = useState<string>(`${year}-12-31`)

  const filters = useMemo(
    () => ({
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    }),
    [startDate, endDate],
  )

  const handleYearChange = (newYear: number) => {
    setYear(newYear)
    setStartDate(`${newYear}-01-01`)
    setEndDate(`${newYear}-12-31`)
  }

  const { data: proposalAnalytics } = analyticsAPI.useGetProposalAnalyticsQuery(filters)
  const { data: targets } = annualTargetAPI.useGetAnnualTargetsQuery()

  const currentYearTarget = useMemo(() => {
    return targets?.find((target) => target.year === year)
  }, [targets, year])

  const monthLabels = useMemo(() => {
    return (
      proposalAnalytics?.labels.map((label) => {
        const monthIndex = Number(label.slice(5, 7)) - 1

        if (Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
          return label
        }

        return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(
          new Date(2000, monthIndex, 1),
        )
      }) || []
    )
  }, [proposalAnalytics?.labels])

  const accumalatedTargetData: number[] = []
  const accumulatedData: number[] = []

  const datasets: ChartDataset<MixedChartType, number[]>[] = []

  if (proposalAnalytics?.labels.length && proposalAnalytics.data?.length) {
    const monthlyTarget =
      currentYearTarget?.annualSubmittedProposalsTarget !== undefined
        ? currentYearTarget.annualSubmittedProposalsTarget / 12
        : undefined

    proposalAnalytics.data.forEach((value, index) => {
      accumulatedData[index] = Math.round((value + (accumulatedData[index - 1] || 0)) * 100) / 100
    })

    datasets.push({
      label: 'Acumulado',
      type: 'line',
      data: accumulatedData,
      borderColor: 'rgb(36, 227, 18)',
      backgroundColor: 'rgba(36, 227, 18, 0.2)',
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: 'rgb(36, 227, 18)',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
    })

    if (monthlyTarget !== undefined) {
      proposalAnalytics.labels.forEach((_, index) => {
        accumalatedTargetData[index] = Math.round(monthlyTarget * (index + 1) * 100) / 100
      })

      datasets.push({
        label: 'Meta',
        type: 'line',
        data: accumalatedTargetData,
        borderColor: 'rgb(255, 231, 0)',
        backgroundColor: 'rgba(255, 231, 0, 0.2)',
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(255, 231, 0)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      })
    }
  }

  const isBelowTarget =
    new Date().getFullYear() === year
      ? accumulatedData[currentMonth] < accumalatedTargetData[currentMonth]
      : accumulatedData[11] < accumalatedTargetData[11]

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <label className="mb-1 block text-md font-medium" htmlFor="year-filter">
            Ano
          </label>
          <input
            type="number"
            min={2021}
            max={currentYear}
            className="w-full rounded border px-3 py-2"
            value={year}
            onChange={(e) => handleYearChange(Number(e.target.value))}
          />
        </div>
        <div className="mr-4">
          {isBelowTarget ? (
            <div className="flex items-center gap-4 border p-2 pr-4 w-fit border-red-500 bg-red-50 rounded-md shadow-sm hover:shadow-lg transition hover:-translate-0.5 hover:scale-[1.02]">
              <X size={50} color="rgb(255, 60, 50)" />
              <p className="text-2xl">Abaixo da meta</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 border p-2 pr-4 w-fit border-green-500 bg-green-50 rounded-md shadow-sm hover:shadow-lg transition hover:-translate-0.5 hover:scale-[1.02]">
              <Circle size={50} color="rgb(32, 209, 91)" />
              <p className="text-2xl">Acima da meta</p>
            </div>
          )}
        </div>
      </div>
      <ReactChart
        key={`annual-submission-${year}`}
        type="bar"
        data={{
          labels: monthLabels,
          datasets: datasets,
        }}
        options={{
          responsive: true,
          animation: {
            duration: 1200,
            easing: 'easeOutCubic',
          },
          animations: {
            x: {
              duration: 900,
              from: -30,
            },
            y: {
              duration: 1200,
              from: 0,
              delay: (ctx: any) => {
                const index = typeof ctx.dataIndex === 'number' ? ctx.dataIndex : 0
                return index * 90
              },
            },
          },
          transitions: {
            active: {
              animation: {
                duration: 250,
              },
            },
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
              },
            },
            datalabels: {
              anchor: 'end',
              align: (ctx: any) => {
                const index = ctx.dataIndex
                const isNear = Math.abs(accumulatedData[index] - accumalatedTargetData[index]) < 15
                return !isNear ? 'start' : ctx.datasetIndex === 0 ? 'top' : 'bottom'
              },
              offset: 8,
              color: '#374151',
              font: {
                weight: 'bolder',
                size: 16,
              },
            },
            title: {
              display: true,
              text: `Propostas Submetidas em ${year}`,
              font: {
                size: 24,
              },

            },
          },
        }}
      />
    </div>
  )
}

export default AnnualAccumulatedSubmissionsAndTarget
