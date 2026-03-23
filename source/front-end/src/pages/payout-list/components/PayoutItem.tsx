import React from 'react'
import StatusBadge from '../../../components/StatusBadge'
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
      <div className="border-t-2 border-gray-200 px-4 py-2 mx-4 grid grid-cols-[40px_56px_2fr_2fr_1fr_1fr_1fr] text-left hover:bg-blue-100 hover:cursor-pointer">
        <div className="flex items-center" onClick={(event) => event.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(payout.id)}
            aria-label={`Selecionar payout ${payout.id}`}
            className="w-4 h-4 cursor-pointer"
          />
        </div>
        <p>{payout.id}</p>
        <p>
          {payout.suggestion.proposal.description.length > 50
            ? `${payout.suggestion.proposal.description.substring(0, 50)}...`
            : payout.suggestion.proposal.description}
        </p>
        <p>
          {payout.suggestion.employee
            ? payout.suggestion.employee.name
            : payout.suggestion.employeeName}
        </p>
        <p>{new Date(payout.createdAt).toLocaleDateString()}</p>
        <p>R$ {Number(payout.value).toFixed(2)}</p>
        <StatusBadge status={payout.status} color={getStatusColor(payout.status)} />
      </div>
    </>
  )
}

export default PayoutItem
