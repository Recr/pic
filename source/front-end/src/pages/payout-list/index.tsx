import { useState } from 'react'
import { payoutAPI } from '../../features/payout/payout-api'
import type { PayoutStatus } from '../../features/payout/types'
import PayoutItem from './components/PayoutItem'

const PayoutList: React.FC = () => {
  const { data: payoutData } = payoutAPI.useGetPayoutsQuery(undefined)
  const [updatePayoutStatus, { isLoading: isUpdatingStatus }] =
    payoutAPI.useUpdatePayoutStatusMutation()
  const [selectedPayoutIds, setSelectedPayoutIds] = useState<number[]>([])
  const [nextStatus, setNextStatus] = useState<PayoutStatus>('PAID')

  const handleToggleSelect = (id: number) => {
    setSelectedPayoutIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id],
    )
  }

  const handleToggleSelectAll = () => {
    if (!payoutData || payoutData.length === 0) return
    if (selectedPayoutIds.length === payoutData.length) {
      setSelectedPayoutIds([])
      return
    }
    setSelectedPayoutIds(payoutData.map((payout) => payout.id))
  }

  const handleUpdateSelectedStatuses = async () => {
    if (selectedPayoutIds.length === 0) return
    try {
      await updatePayoutStatus({ ids: selectedPayoutIds, status: nextStatus }).unwrap()
      setSelectedPayoutIds([])
    } catch (error) {
      console.error('Failed to update payout statuses', error)
    }
  }

  const canUpdate = selectedPayoutIds.length > 0 && !isUpdatingStatus

  return (
    <>
      <div className="text-left text-2xl font-semibold my-4 mx-4">Lista de Pagamentos</div>
      <div className="mx-4 mb-4 flex items-center gap-3">
        <label htmlFor="payout-next-status" className="text-sm font-medium text-gray-700">
          Novo status
        </label>
        <select
          id="payout-next-status"
          value={nextStatus}
          onChange={(event) => setNextStatus(event.target.value as PayoutStatus)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="PENDING">Pendente</option>
          <option value="PAID">Pago</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
        <button
          type="button"
          onClick={handleUpdateSelectedStatuses}
          disabled={!canUpdate}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded px-3 py-1.5 text-sm cursor-pointer disabled:cursor-not-allowed"
        >
          {isUpdatingStatus
            ? 'Atualizando...'
            : `Atualizar selecionados (${selectedPayoutIds.length})`}
        </button>
      </div>
      <div className="flex justify-center flex-col">
        <div className="grid grid-cols-[40px_56px_2fr_2fr_1fr_1fr_1fr] gap-4 px-4 py-2 border-b-2 border-gray-200 font-semibold mx-4 text-left">
          <input
            type="checkbox"
            checked={
              payoutData !== undefined && payoutData.length > 0
                ? selectedPayoutIds.length === payoutData.length
                : false
            }
            onChange={handleToggleSelectAll}
            aria-label="Selecionar todos os pagamentos"
            className="w-4 h-4 cursor-pointer"
          />
          <p>ID</p>
          <p>Proposta</p>
          <p>Colaborador</p>
          <p>Data</p>
          <p>Valor</p>
          <p>Status</p>
        </div>
        {payoutData?.map((payout) => (
          <PayoutItem
            key={payout.id}
            payout={payout}
            isSelected={selectedPayoutIds.includes(payout.id)}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </div>
    </>
  )
}

export default PayoutList
