import { Chart as ReactChart } from 'react-chartjs-2'
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineController,
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
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
)

const AnnualImplementationAndTarget: React.FC = () => {
  const [year, setYear] = useState(currentYear)
  const [startDate, setStartDate] = useState<string>(`${year}-01-01`)
  const [endDate, setEndDate] = useState<string>(`${year}-12-31`)
  const [leftAxisScale, setLeftAxisScale] = useState(1)

  const filters = useMemo(
    () => ({
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      status: 'IMPLEMENTED',
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

  const leftAxisSuggestedMax = useMemo(() => {
    if (!proposalAnalytics?.data?.length) {
      return undefined
    }

    const highestValue = Math.max(...proposalAnalytics.data)
    return Math.max(highestValue * leftAxisScale, highestValue)
  }, [proposalAnalytics?.data, leftAxisScale])

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

  const datasets = useMemo<ChartDataset<MixedChartType, number[]>[]>(() => {
    const dataset: ChartDataset<MixedChartType, number[]>[] = []

    if (!proposalAnalytics?.labels.length || !proposalAnalytics.data?.length) {
      return dataset
    }

    const monthlyTarget =
      currentYearTarget?.annualImplementedProposalsTarget !== undefined
        ? currentYearTarget.annualImplementedProposalsTarget / 12
        : undefined

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
      const accumulatedTargetData: number[] = []
      proposalAnalytics.labels.forEach((_, index) => {
        accumulatedTargetData[index] = monthlyTarget * (index + 1)
      })

      dataset.push({
        label: 'Meta',
        type: 'line',
        yAxisID: 'y',
        data: accumulatedTargetData,
        borderColor: 'rgb(255, 231, 0)',
        backgroundColor: 'rgba(255, 231, 0, 0.2)',
      })
    }

    return dataset
  }, [proposalAnalytics, currentYearTarget])

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
      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium" htmlFor="left-axis-scale">
          Eixo esquerdo: {leftAxisScale.toFixed(1)}x
        </label>
        <input
          id="left-axis-scale"
          type="range"
          min={1}
          max={5}
          step={0.1}
          className="w-full"
          value={leftAxisScale}
          onChange={(e) => setLeftAxisScale(Number(e.target.value))}
        />
      </div>
      <div className="mt-4 h-64 w-full sm:h-80">
        <ReactChart
          key={`annual-implementation-${year}`}
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
                suggestedMax: leftAxisSuggestedMax,
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
              title: {
                display: true,
                text: `Propostas Implementadas em ${year}`,
              },
              datalabels: {
                display: false,
              },
            },
          }}
        />
      </div>
    </div>
  )
}

export default AnnualImplementationAndTarget
