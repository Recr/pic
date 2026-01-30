import { translateStatus } from '../helpers/translateStatus'

interface StatusBadgeProps {
  status: string
  color: 'blue' | 'red' | 'yellow' | 'green'
}

const colorMap = {
  blue: 'bg-blue-200 text-blue-800',
  red: 'bg-red-200 text-red-800',
  yellow: 'bg-yellow-200 text-yellow-800',
  green: 'bg-green-200 text-green-800',
}

const dotColorMap = {
  blue: 'bg-blue-600',
  red: 'bg-red-600',
  yellow: 'bg-yellow-600',
  green: 'bg-green-600',
}

const StatusBadge = (props: StatusBadgeProps) => {
  return (
    <div className={`flex items-center gap-2 px-2 rounded-xl ${colorMap[props.color]}`}>
      <div className={`w-2.5 h-2.5 rounded-full ${dotColorMap[props.color]}`}></div>
      <span>{translateStatus(props.status)}</span>
    </div>
  )
}

export default StatusBadge
