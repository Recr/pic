import type { Employee } from '../../features/proposal/types'

interface EmployeeInformationBadgeProps {
  suggestion: {
    employeeName: string
    employeeRe: number
    employeeShift?: string
    employee?: Employee
  }
  id: number
  className?: string
}

const EmployeeInformationBadge: React.FC<EmployeeInformationBadgeProps> = ({
  suggestion,
  id,
  className,
}) => {
  return (
    <p key={`${id}-${suggestion.employee?.name || suggestion.employeeName}`} className={className}>
      <span className="text-gray-700 font-bold">
        {suggestion.employee ? suggestion.employee.name : suggestion.employeeName}
      </span>
      <br />
      <span className="text-gray-500">
        {'Matrícula: '}
        {suggestion.employee ? suggestion.employee.re : suggestion.employeeRe}
        {' | '}
        Turno: {suggestion.employee ? suggestion.employee.shift : suggestion.employeeShift}
      </span>
    </p>
  )
}

export default EmployeeInformationBadge
