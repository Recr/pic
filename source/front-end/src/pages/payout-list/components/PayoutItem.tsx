import React from 'react'
import StatusBadge from '../../../components/badges/StatusBadge'
import { getStatusColor } from '../../../helpers/getStatusColor'
import type { Payout } from '../../../features/payout/types'
import { Banknote, CalendarIcon, IdCardIcon, UserIcon } from 'lucide-react'

type PayoutItemProps = {
  payout: Payout
  isSelected: boolean
  onToggleSelect: (id: number) => void
}

const borderColors: Record<string, string> = {
  IMPLEMENTED: 'border-green-300',
  REJECTED: 'border-red-300',
  DEFINE_CHAMPION: 'border-blue-300',
  WAITING_APPROVAL: 'border-orange-300',
  UNDER_VALIDATION: 'border-orange-300',
  TO_IMPLEMENT: 'border-yellow-300',
  IMPLEMENTATION: 'border-cyan-300',
  NOT_VIABLE: 'border-gray-300',
  PENDING: 'border-orange-300',
  PAID: 'border-green-300',
  CANCELLED: 'border-red-300',
}

const PayoutItem: React.FC<PayoutItemProps> = ({ payout, isSelected, onToggleSelect }) => {
  return (
    <>
      <div
        className={`grid grid-cols-1 gap-2 border-gray-200 border-l-8 md:border-l-4  ${borderColors[payout.status] ?? 'border-gray-300'} px-3 py-3 text-sm hover:cursor-pointer hover:bg-blue-100  md:grid-cols-[40px_56px_2fr_2fr_1fr_1fr_1fr_1fr] md:gap-0 md:px-4 md:py-2 hover:translate-y-1 hover:animate-pulse transition-all shadow-lg md:shadow-none rounded-md md:rounded-none`}
      >
        <div className="flex items-center" onClick={(event) => event.stopPropagation()}>
          {/* TODO: Implement checkbox functionality with shift to select multiple */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(payout.id)}
            aria-label={`Selecionar payout ${payout.id}`}
            className="w-4 h-4 cursor-pointer"
          />
        </div>
        {/* <p className="font-semibold text-lg md:text-sm flex items-center">
          <span className="md:hidden">#</span>
          {payout.suggestion.proposal.id}
        </p> */}
        <div className="flex justify-between">
          <p className="font-semibold text-lg md:text-sm flex items-center">
            <span className="md:hidden">#</span>
            {payout.suggestion.proposal.id}
          </p>
          <StatusBadge
            status={payout.status}
            color={getStatusColor(payout.status)}
            className="flex md:hidden lg:hidden"
          />
        </div>
        <p className="font-semibold md:font-normal text-md md:text-xs mb-2 md:mb-0 flex items-center md:pr-4">
          {payout.suggestion.proposal.description.length > 50
            ? `${payout.suggestion.proposal.description.substring(0, 50)}...`
            : payout.suggestion.proposal.description}
        </p>
        {/* <p>
          <span className="font-semibold md:hidden">Colaborador: </span>
          {payout.suggestion.employee
            ? payout.suggestion.employee.name
            : payout.suggestion.employeeName}
        </p> */}
        <p className="flex items-center gap-2 text-gray-700 text-xs md:pr-4">
          <UserIcon size={16} className="text-gray-400 md:hidden" />
          {payout.suggestion.employee
            ? payout.suggestion.employee.name
            : payout.suggestion.employeeName}
        </p>
        <div className="flex gap-3 md:hidden">
          <p className="flex items-center gap-2 text-gray-700 text-xs">
            <IdCardIcon size={16} className="text-gray-400" />
            <span>RE</span>
            {payout.suggestion.employee
              ? payout.suggestion.employee.re
              : payout.suggestion.employeeRe}
          </p>
          <p className="flex items-center gap-2 text-gray-700 text-xs">
            <CalendarIcon size={16} className="text-gray-400 md:hidden" />
            {new Date(payout.createdAt).toLocaleDateString()}
          </p>
        </div>
        <p className="items-center text-gray-700 text-xs hidden md:flex md:pr-4">
          <IdCardIcon size={16} className="text-gray-400 md:hidden" />
          <span className="md:hidden">RE</span>
          {payout.suggestion.employee
            ? payout.suggestion.employee.re
            : payout.suggestion.employeeRe}
        </p>
        <p className="items-center text-gray-700 text-xs hidden md:flex md:pr-4">
          <CalendarIcon size={16} className="text-gray-400 md:hidden" />
          {new Date(payout.createdAt).toLocaleDateString()}
        </p>
        <p className="flex items-center gap-2 text-green-500 font-semibold md:text-md md:pr-4 text-xs">
          <Banknote size={16} className="text-green-400 md:hidden" />
          R$ {Number(payout.value).toFixed(2)}
        </p>
        <StatusBadge
          status={payout.status}
          color={getStatusColor(payout.status)}
          className="hidden md:flex lg:flex "
          hasText={false}
        />
      </div>
    </>
  )
}

export default PayoutItem
