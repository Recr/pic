import { useState } from 'react'
import * as XLSX from 'xlsx'
import { payoutAPI } from '../../features/payout/payout-api'
import type { PayoutStatus } from '../../features/payout/types'
import PayoutItem from './components/PayoutItem'
import { Skeleton } from '../../components/skeletons/Skeleton'
import DropdownSelect from '../../components/DropdownSelect'

const PayoutList: React.FC = () => {
  const { data: payoutData, isLoading } = payoutAPI.useGetPayoutsQuery(undefined)
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

  const handleExportExcel = () => {
    if (!payoutData || payoutData.length === 0) return

    let selectedPayouts

    if (selectedPayoutIds.length > 0) {
      selectedPayouts = payoutData.filter((payout) => selectedPayoutIds.includes(payout.id))
    } else {
      selectedPayouts = payoutData
    }
    const rows = selectedPayouts.map((payout) => ({
      ID: payout.id,
      PropostaID: payout.suggestion.proposal.id,
      Proposta: payout.suggestion.proposal.description,
      Colaborador: payout.suggestion.employeeName,
      RE: payout.suggestion.employeeRe,
      Turno: payout.suggestion.employeeShift,
      DataCriacao: new Date(payout.createdAt).toLocaleDateString('pt-BR'),
      Valor: payout.value,
      Status: payout.status,
      DataPagamento: payout.payedAt ? new Date(payout.payedAt).toLocaleDateString('pt-BR') : '',
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagamentos')

    const dateTag = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(workbook, `pagamentos-${dateTag}.xlsx`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
        <div className="rounded-lg bg-white py-4 shadow-custom sm:py-5">
          <Skeleton className="mx-4 my-3 h-8 w-56 sm:my-4 sm:h-9" />
          <div className="mx-4 mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md sm:w-28" />
            <Skeleton className="h-9 w-full rounded-md sm:w-56" />
            <Skeleton className="h-9 w-full rounded-md sm:w-36" />
          </div>
          <div className="mx-3 flex flex-col justify-center rounded-lg border border-gray-300 text-sm sm:mx-4">
            <div className="mx-4 hidden grid-cols-[40px_56px_2fr_2fr_1fr_1fr_1fr_1fr] border-b-2 border-gray-200 px-4 py-2 md:grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full rounded-md" />
              ))}
            </div>
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 md:grid-cols-[40px_56px_2fr_2fr_1fr_1fr_1fr_1fr]"
                >
                  {Array.from({ length: 8 }).map((_, cellIndex) => (
                    <Skeleton key={cellIndex} className="h-4 w-full rounded-md" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
      <div className="rounded-lg bg-white py-4 shadow-custom sm:py-5">
        <div className="mx-4 my-3 text-left text-xl font-semibold sm:my-4 sm:text-2xl">
          Lista de Pagamentos
        </div>
        <div className="mx-4 mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <DropdownSelect
            id="payout-next-status"
            label="Novo status"
            value={nextStatus}
            onChange={(value) => setNextStatus(value as PayoutStatus)}
            placeholder="Selecione"
            options={[
              { value: 'PENDING', label: 'Pendente' },
              { value: 'PAID', label: 'Pago' },
              { value: 'CANCELLED', label: 'Cancelado' },
            ]}
            className="w-full sm:w-auto"
            buttonClassName="w-full rounded border border-gray-300 px-2 py-1 text-sm sm:w-auto"
            menuClassName="sm:w-56"
          />
          <button
            type="button"
            onClick={handleUpdateSelectedStatuses}
            disabled={!canUpdate}
            className="w-full cursor-pointer rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
          >
            {isUpdatingStatus
              ? 'Atualizando...'
              : `Atualizar selecionados (${selectedPayoutIds.length})`}
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={!payoutData || payoutData.length === 0}
            className="w-full cursor-pointer rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
          >
            Exportar Excel
          </button>
        </div>
        <div className="mx-3 flex flex-col justify-center rounded-lg border border-gray-300 text-sm sm:mx-4">
          <div className="mx-4 hidden grid-cols-[40px_56px_2fr_2fr_1fr_1fr_1fr_1fr] border-b-2 border-gray-200 px-4 py-2 font-semibold md:grid">
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
            <p>RE</p>
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
      </div>
    </div>
  )
}

export default PayoutList
