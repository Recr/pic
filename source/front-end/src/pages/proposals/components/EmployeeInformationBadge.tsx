import type { Employee } from '../../../features/proposal/types'

interface EmployeeInformationBadgeProps {
  suggestion: {
    employeeName: string
    employeeRe: number
    employeeShift?: string | undefined
    employee?: Employee | undefined
  }
  id: number
}

const EmployeeInformationBadge: React.FC<EmployeeInformationBadgeProps> = ({ suggestion, id }) => {
  return (
    <p
      key={`${id}-${suggestion.employee?.name || suggestion.employeeName}`}
      className="bg-gray-100 px-2 py-1 rounded text-sm"
    >
      <span className="text-gray-700 font-bold">
        {suggestion.employee ? suggestion.employee.name : suggestion.employeeName}
      </span>
      <span className="text-xs text-gray-500 ml-1">
        {suggestion.employee ? suggestion.employee.re : suggestion.employeeRe}
        {' - '}
        Turno: {suggestion.employee ? suggestion.employee.shift : suggestion.employeeShift}
      </span>
    </p>
  )
}

export default EmployeeInformationBadge
