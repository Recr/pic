import React from 'react'
import StatusBadge from '../../../components/badges/StatusBadge'
import { getStatusColor } from '../../../helpers/getStatusColor'
import type { Payout } from '../../../features/payout/types'

type PayoutItemProps = {
  payout: Payout
  isSelected: boolean
  onToggleSelect: (id: number) => void
}

const PayoutItem: React.FC<PayoutItemProps> = ({ payout, isSelected, onToggleSelect }) => {
  return (
    <>
      <div className="mx-3 grid grid-cols-1 gap-2 border-t-2 border-gray-200 px-3 py-3 text-sm hover:cursor-pointer hover:bg-blue-100 sm:mx-4 md:grid-cols-[40px_56px_2fr_2fr_1fr_1fr_1fr_1fr] md:gap-0 md:px-4 md:py-2">
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
        <p>
          <span className="font-semibold md:hidden">ID: </span>
          {payout.id}
        </p>
        <p>
          <span className="font-semibold md:hidden">Proposta: </span>
          {payout.suggestion.proposal.description.length > 50
            ? `${payout.suggestion.proposal.description.substring(0, 50)}...`
            : payout.suggestion.proposal.description}
        </p>
        <p>
          <span className="font-semibold md:hidden">Colaborador: </span>
          {payout.suggestion.employee
            ? payout.suggestion.employee.name
            : payout.suggestion.employeeName}
        </p>
        <p>
          <span className="font-semibold md:hidden">RE: </span>
          {payout.suggestion.employee
            ? payout.suggestion.employee.re
            : payout.suggestion.employeeRe}
        </p>
        <p>
          <span className="font-semibold md:hidden">Data: </span>
          {new Date(payout.createdAt).toLocaleDateString()}
        </p>
        <p>
          <span className="font-semibold md:hidden">Valor: </span>R${' '}
          {Number(payout.value).toFixed(2)}
        </p>
        <div>
          <span className="font-semibold md:hidden">Status: </span>
          <StatusBadge status={payout.status} color={getStatusColor(payout.status)} />
        </div>
      </div>
    </>
  )
}

export default PayoutItem
