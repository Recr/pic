import { useState } from 'react'
import { FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { payoutAPI } from '../../features/payout/payout-api'
import type { PayoutStatus } from '../../features/payout/types'
import PayoutItem from './components/PayoutItem'
import { Skeleton } from '../../components/skeletons/Skeleton'
import DropdownSelect from '../../components/inputs/DropdownSelect'

const statusLabels: Record<PayoutStatus, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
}

const PayoutList: React.FC = () => {
  const { data: payoutData, isLoading } = payoutAPI.useGetPayoutsQuery(undefined)
  const [updatePayoutStatus, { isLoading: isUpdatingStatus }] =
    payoutAPI.useUpdatePayoutStatusMutation()
  const [selectedPayoutIds, setSelectedPayoutIds] = useState<number[]>([])
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)
  const [nextStatus, setNextStatus] = useState<PayoutStatus>('PAID')

  const getSelectedOrAllPayouts = () => {
    if (!payoutData || payoutData.length === 0) return []

    if (selectedPayoutIds.length === 0) return payoutData

    return payoutData.filter((payout) => selectedPayoutIds.includes(payout.id))
  }

  const handleToggleSelect = (id: number, isShiftPressed = false) => {
    if (!payoutData || payoutData.length === 0) return

    const currentIndex = payoutData.findIndex((payout) => payout.id === id)
    if (currentIndex === -1) return

    const isCurrentlySelected = selectedPayoutIds.includes(id)

    if (isShiftPressed && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, currentIndex)
      const end = Math.max(lastSelectedIndex, currentIndex)
      const rangeIds = payoutData.slice(start, end + 1).map((payout) => payout.id)

      setSelectedPayoutIds((prev) => {
        if (isCurrentlySelected) {
          return prev.filter((selectedId) => !rangeIds.includes(selectedId))
        }

        const mergedIds = new Set(prev)
        rangeIds.forEach((rangeId) => mergedIds.add(rangeId))
        return Array.from(mergedIds)
      })

      setLastSelectedIndex(currentIndex)
      return
    }

    setSelectedPayoutIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id],
    )
    setLastSelectedIndex(currentIndex)
  }

  const handleToggleSelectAll = () => {
    if (!payoutData || payoutData.length === 0) return
    if (selectedPayoutIds.length === payoutData.length) {
      setSelectedPayoutIds([])
      setLastSelectedIndex(null)
      return
    }
    setSelectedPayoutIds(payoutData.map((payout) => payout.id))
    setLastSelectedIndex(payoutData.length - 1)
  }

  const handleUpdateSelectedStatuses = async () => {
    if (selectedPayoutIds.length === 0) return
    try {
      await updatePayoutStatus({ ids: selectedPayoutIds, status: nextStatus }).unwrap()
      setSelectedPayoutIds([])
      setLastSelectedIndex(null)
    } catch (error) {
      console.error('Failed to update payout statuses', error)
    }
  }

  const canUpdate = selectedPayoutIds.length > 0 && !isUpdatingStatus

  const handleExportExcel = () => {
    const selectedPayouts = getSelectedOrAllPayouts()
    if (selectedPayouts.length === 0) return

    const rows = selectedPayouts.map((payout) => ({
      ID: payout.id,
      PropostaID: payout.suggestion.proposal.id,
      Proposta: payout.suggestion.proposal.description,
      Colaborador: payout.suggestion.employeeName,
      RE: payout.suggestion.employeeRe,
      Turno: payout.suggestion.employeeShift,
      DataCriacao: new Date(payout.createdAt).toLocaleDateString('pt-BR'),
      Valor: payout.value,
      Status: statusLabels[payout.status],
      DataPagamento: payout.payedAt ? new Date(payout.payedAt).toLocaleDateString('pt-BR') : '',
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagamentos')

    const dateTag = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(workbook, `pagamentos-${dateTag}.xlsx`)
  }

  const handleExportPdf = () => {
    const selectedPayouts = getSelectedOrAllPayouts()
    if (selectedPayouts.length === 0) return

    const formatDate = (value: string | null) =>
      value ? new Date(value).toLocaleDateString('pt-BR') : '-'

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value)

    const totalValue = selectedPayouts.reduce((acc, payout) => acc + Number(payout.value), 0)

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    })

    doc.setFillColor(15, 118, 110)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 84, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.text('Relatorio de Pagamentos', 40, 36)

    doc.setFontSize(10)
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 40, 56)
    doc.text(
      selectedPayoutIds.length > 0 ? 'Escopo: itens selecionados' : 'Escopo: lista completa',
      40,
      70,
    )

    doc.setTextColor(35, 35, 35)
    doc.setFontSize(11)
    doc.text(`Registros: ${selectedPayouts.length}`, 40, 108)
    doc.text(`Valor total: ${formatCurrency(totalValue)}`, 180, 108)

    autoTable(doc, {
      startY: 122,
      margin: { left: 36, right: 36, bottom: 32 },
      head: [['ID', 'Proposta', 'Colaborador', 'RE', 'Data', 'Valor', 'Status', 'Pagamento']],
      body: selectedPayouts.map((payout) => [
        payout.id,
        payout.suggestion.proposal.description,
        payout.suggestion.employee?.name ?? payout.suggestion.employeeName,
        payout.suggestion.employee?.re ?? payout.suggestion.employeeRe,
        formatDate(payout.createdAt),
        formatCurrency(Number(payout.value)),
        statusLabels[payout.status],
        formatDate(payout.payedAt),
      ]),
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 5,
        textColor: [45, 45, 45],
        lineColor: [220, 220, 220],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [20, 93, 84],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [247, 250, 250],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 36 },
        1: { cellWidth: 250 },
        2: { cellWidth: 120 },
        3: { halign: 'center', cellWidth: 52 },
        4: { halign: 'center', cellWidth: 62 },
        5: { halign: 'right', cellWidth: 72 },
        6: { halign: 'center', cellWidth: 66 },
        7: { halign: 'center', cellWidth: 62 },
      },
    })

    const totalPages = doc.getNumberOfPages()
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page)
      doc.setFontSize(9)
      doc.setTextColor(120, 120, 120)
      doc.text(
        `Pagina ${page} de ${totalPages}`,
        doc.internal.pageSize.getWidth() - 92,
        doc.internal.pageSize.getHeight() - 14,
      )
    }

    const dateTag = new Date().toISOString().slice(0, 10)
    doc.save(`pagamentos-${dateTag}.pdf`)
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
        <div className="mx-4 mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
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
            buttonClassName="w-full border border-[#ccc] rounded bg-white hover:cursor-pointer hover:bg-blue-100 transition-colors"
            menuClassName="sm:w-56"
          />
          <button
            type="button"
            onClick={handleUpdateSelectedStatuses}
            disabled={!canUpdate}
            className="w-full cursor-pointer rounded bg-blue-600 px-3 py-2.25 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
          >
            {isUpdatingStatus
              ? 'Atualizando...'
              : `Atualizar selecionados (${selectedPayoutIds.length})`}
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={!payoutData || payoutData.length === 0}
            className="w-full cursor-pointer rounded bg-emerald-600 px-3 py-2.25 text-sm text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
          >
            Exportar Excel
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={!payoutData || payoutData.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded bg-linear-to-r from-cyan-600 via-teal-600 to-emerald-600 px-3 py-2.25 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 hover:shadow-lg disabled:cursor-not-allowed disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-500 sm:w-auto"
          >
            <FileDown size={16} />
            Exportar PDF
          </button>
        </div>
        <div className="mx-3 flex flex-col justify-center rounded-lg md:border border-gray-300 text-sm sm:mx-4">
          <div className=" hidden grid-cols-[40px_56px_2fr_2fr_1fr_1fr_1fr_1fr] border-b-2 border-gray-200 px-4 py-2 font-semibold md:grid bg-gray-300">
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
            <p className="text-center lg:text-left">Status</p>
          </div>
          <div className="flex flex-col gap-3 md:gap-0">
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
    </div>
  )
}

export default PayoutList
