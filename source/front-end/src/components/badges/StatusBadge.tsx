import { translateStatus } from '../../helpers/translateStatus'

export type StatusBadgeColor = 'blue' | 'red' | 'yellow' | 'green' | 'orange' | 'cyan' | 'gray'

export interface StatusBadgeColors {
  color: StatusBadgeColor
}

interface StatusBadgeProps extends StatusBadgeColors {
  status: string
  className?: string
}

const colorMap = {
  blue: 'bg-blue-200 text-blue-800',
  red: 'bg-red-200 text-red-800',
  yellow: 'bg-yellow-200 text-yellow-800',
  green: 'bg-green-200 text-green-800',
  orange: 'bg-orange-200 text-orange-800',
  cyan: 'bg-cyan-200 text-cyan-800',
  gray: 'bg-gray-200 text-gray-800',
}

const dotColorMap = {
  blue: 'bg-blue-600',
  red: 'bg-red-600',
  yellow: 'bg-yellow-600',
  green: 'bg-green-600',
  orange: 'bg-orange-600',
  cyan: 'bg-cyan-600',
  gray: 'bg-gray-600',
}

const StatusBadge = (props: StatusBadgeProps) => {
  return (
    <div
      className={`flex items-center gap-2 px-2 rounded-xl ${colorMap[props.color]} text-xs ${props.className || ''}`}
    >
      <div className={`w-2.5 h-2.5 rounded-full ${dotColorMap[props.color]}`}></div>
      <span>{translateStatus(props.status)}</span>
    </div>
  )
}

export default StatusBadge
