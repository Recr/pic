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
import { analyticsAPI } from '../../../features/analytics/analytics-api'
import { useMemo, useState } from 'react'
import { annualTargetAPI } from '../../../features/annual-target/annual-target-api'

const currentYear = new Date().getFullYear()
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
)

const MonthlySubmissionAccumulatedAndTarget: React.FC = () => {
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

  // const [showTrend, setShowTrend] = useState(false)

  const datasets = useMemo<ChartDataset<MixedChartType, number[]>[]>(() => {
    const dataset: ChartDataset<MixedChartType, number[]>[] = []

    if (!proposalAnalytics?.labels.length || !proposalAnalytics.data?.length) {
      return dataset
    }

    const monthlyTarget =
      currentYearTarget?.annualSubmittedProposalsTarget !== undefined
        ? currentYearTarget.annualSubmittedProposalsTarget / 12
        : undefined

    // Build tendency only until the last month with real values to avoid a fake downtrend at year end.
    // if (showTrend) {
    //   const lastInfoIndex = proposalAnalytics.data.reduce(
    //     (lastIndex, value, index) => (value > 0 ? index : lastIndex),
    //     -1,
    //   )
    //   const trendBaseData =
    //     lastInfoIndex >= 0
    //       ? proposalAnalytics.data.slice(0, lastInfoIndex + 1)
    //       : proposalAnalytics.data

    //   const n = trendBaseData.length
    //   const sumX = trendBaseData.reduce((acc, _, index) => acc + index, 0)
    //   const sumY = trendBaseData.reduce((acc, value) => acc + value, 0)
    //   const sumXY = trendBaseData.reduce((acc, value, index) => acc + index * value, 0)
    //   const sumXX = trendBaseData.reduce((acc, _, index) => acc + index * index, 0)

    //   const denominator = n * sumXX - sumX * sumX
    //   const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator
    //   const intercept = (sumY - slope * sumX) / n

    //   const trendLineData = proposalAnalytics.data.map((_, index) => {
    //     if (lastInfoIndex >= 0 && index > lastInfoIndex) {
    //       return Number.NaN
    //     }

    //     const value = slope * index + intercept
    //     return value > 0 ? value : 0
    //   })

    //   dataset.push({
    //     label: 'Tendencia',
    //     type: 'line',
    //     yAxisID: 'yBars',
    //     data: trendLineData,
    //     borderColor: 'rgb(245, 158, 11)',
    //     backgroundColor: 'rgba(245, 158, 11, 0.2)',
    //     borderDash: [6, 4],
    //     pointRadius: 0,
    //     tension: 0,
    //     spanGaps: false,
    //   })
    // }

    const accumulatedData: number[] = []
    proposalAnalytics.data.forEach((value, index) => {
      accumulatedData[index] = value + (accumulatedData[index - 1] || 0)
    })

    dataset.push({
      label: 'Acumulado',
      type: 'line',
      yAxisID: 'y',
      data: accumulatedData,
      borderColor: 'rgb(36, 227, 18)',
      backgroundColor: 'rgba(36, 227, 18, 0.2)',
    })

    dataset.push({
      label: 'Propostas',
      type: 'bar',
      yAxisID: 'yBars',
      data: proposalAnalytics.data,
      borderColor: proposalAnalytics.data.map((value) =>
        monthlyTarget !== undefined && value < monthlyTarget
          ? 'rgb(220, 38, 38)'
          : 'rgb(75, 192, 192)',
      ),
      backgroundColor: proposalAnalytics.data.map((value) =>
        monthlyTarget !== undefined && value < monthlyTarget
          ? 'rgba(220, 38, 38, 0.4)'
          : 'rgba(75, 192, 192, 0.4)',
      ),
    })

    if (monthlyTarget !== undefined) {
      const accumalatedTargetData: number[] = []
      proposalAnalytics.labels.forEach((_, index) => {
        accumalatedTargetData[index] = Math.round(monthlyTarget * (index + 1) * 100) / 100
      })

      dataset.push({
        label: 'Meta',
        type: 'line',
        yAxisID: 'y',
        data: accumalatedTargetData,
        borderColor: 'rgb(255, 231, 0)',
        backgroundColor: 'rgba(255, 231, 0, 0.2)',
      })
    }

    return dataset
  }, [proposalAnalytics, currentYearTarget /*showTrend*/])

  return (
    <div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="year-filter">
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
      {/* <input type="checkbox" id="show-trend" onChange={(e) => setShowTrend(e.target.checked)} />
      <label htmlFor="show-trend">Mostrar tendência</label> */}
      <div className="mt-4 h-64 w-full sm:h-80">
        <ReactChart
          key={`annual-submission-${year}`}
          type="bar"
          data={{
            labels: monthLabels,
            datasets: datasets,
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
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
            scales: {
              yBars: {
                type: 'linear',
                position: 'left',
                grid: {
                  drawOnChartArea: false,
                },
                title: {
                  display: true,
                  text: 'Propostas',
                },
              },
              y: {
                type: 'linear',
                position: 'right',
                title: {
                  display: true,
                },
              },
            },
            plugins: {
              legend: {
                position: 'top',
              },
              datalabels: {
                display: false,
              },
              title: {
                display: true,
                text: `Propostas Submetidas em ${year}`,
              },
            },
          }}
        />
      </div>
    </div>
  )
}

export default MonthlySubmissionAccumulatedAndTarget
