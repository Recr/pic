import { useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { FileDown } from 'lucide-react'
import * as XLSX from 'xlsx'
import { payoutAPI } from '../../features/payout/payout-api'
import type { Payout, PayoutStatus } from '../../features/payout/types'
import { Skeleton } from '../../components/skeletons/Skeleton'
import DropdownSelect from '../../components/inputs/DropdownSelect'
import Modal from '../../components/modal/Modal'
import PayoutItem from './components/PayoutItem'
import PayoutInvoiceDocument from './components/PayoutInvoiceDocument'
import PayoutInvoicePreview from './components/PayoutInvoicePreview'

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
  const [invoicePayouts, setInvoicePayouts] = useState<Payout[]>([])
  const [invoiceDate, setInvoiceDate] = useState(new Date())
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false)
  const [exportShowId, setExportShowId] = useState(true)
  const [exportShowName, setExportShowName] = useState(true)
  const [exportShowRE, setExportShowRE] = useState(true)
  const [exportShowProposal, setExportShowProposal] = useState(true)
  const [exportShowPaymentValue, setExportShowPaymentValue] = useState(true)
  const [exportShowStatus, setExportShowStatus] = useState(true)
  const [exportShowSignatureFields, setExportShowSignatureFields] = useState(true)

  const getSelectedOrAllPayouts = () => {
    if (!payoutData?.length) return []
    return selectedPayoutIds.length === 0
      ? payoutData
      : payoutData.filter((payout) => selectedPayoutIds.includes(payout.id))
  }

  const handleToggleSelect = (id: number, isShiftPressed = false) => {
    if (!payoutData?.length) return
    const currentIndex = payoutData.findIndex((payout) => payout.id === id)
    if (currentIndex === -1) return
    const isCurrentlySelected = selectedPayoutIds.includes(id)
    if (isShiftPressed && lastSelectedIndex !== null) {
      const rangeIds = payoutData
        .slice(
          Math.min(lastSelectedIndex, currentIndex),
          Math.max(lastSelectedIndex, currentIndex) + 1,
        )
        .map((payout) => payout.id)
      setSelectedPayoutIds((previous) =>
        isCurrentlySelected
          ? previous.filter((selectedId) => !rangeIds.includes(selectedId))
          : Array.from(new Set([...previous, ...rangeIds])),
      )
    } else {
      setSelectedPayoutIds((previous) =>
        previous.includes(id)
          ? previous.filter((selectedId) => selectedId !== id)
          : [...previous, id],
      )
    }
    setLastSelectedIndex(currentIndex)
  }

  const handleToggleSelectAll = () => {
    if (!payoutData?.length) return
    const allSelected = selectedPayoutIds.length === payoutData.length
    setSelectedPayoutIds(allSelected ? [] : payoutData.map((payout) => payout.id))
    setLastSelectedIndex(allSelected ? null : payoutData.length - 1)
  }

  const handleUpdateSelectedStatuses = async () => {
    if (!selectedPayoutIds.length) return
    try {
      await updatePayoutStatus({ ids: selectedPayoutIds, status: nextStatus }).unwrap()
      setSelectedPayoutIds([])
      setLastSelectedIndex(null)
    } catch (error) {
      console.error('Failed to update payout statuses', error)
    }
  }

  const handleExportExcel = () => {
    const selectedPayouts = getSelectedOrAllPayouts()
    if (!selectedPayouts.length) return
    const rows = selectedPayouts.map((payout) => ({
      ID: Number(payout.id),
      PropostaID: Number(payout.suggestion.proposal.id),
      Proposta: payout.suggestion.proposal.description,
      Colaborador: payout.suggestion.employeeName,
      RE: Number(payout.suggestion.employeeRe),
      Turno: payout.suggestion.employeeShift,
      DataCriacao: new Date(payout.createdAt).toLocaleDateString('pt-BR'),
      Valor: Number(payout.value),
      Status: statusLabels[payout.status],
      DataPagamento: payout.payedAt ? new Date(payout.payedAt).toLocaleDateString('pt-BR') : '',
    }))
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagamentos')
    XLSX.writeFile(workbook, `pagamentos-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const handleOpenInvoice = () => {
    const selectedPayouts = getSelectedOrAllPayouts()
    if (!selectedPayouts.length) return
    setInvoicePayouts(selectedPayouts)
    setInvoiceDate(new Date())
    setIsPdfPreviewOpen(true)
  }

  const invoiceDocument = (
    <PayoutInvoiceDocument
      payouts={invoicePayouts}
      issuedAt={invoiceDate}
      showId={exportShowId}
      showName={exportShowName}
      showRE={exportShowRE}
      showProposal={exportShowProposal}
      showPaymentValue={exportShowPaymentValue}
      showStatus={exportShowStatus}
      showSignatureFields={exportShowSignatureFields}
    />
  )

  if (isLoading) {
    return (
      <div className="min-h-screen px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
        <div className="rounded-lg bg-white py-4 shadow-custom sm:py-5">
          <Skeleton className="mx-4 my-3 h-8 w-56 sm:my-4 sm:h-9" />
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-primary-gray md:px-4 md:py-8">
        <div className="rounded-xl bg-white py-4 shadow-custom">
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
              buttonClassName="w-full rounded border border-[#ccc] bg-white transition-colors hover:cursor-pointer hover:bg-blue-100"
              menuClassName="sm:w-56"
            />
            <button
              type="button"
              onClick={handleUpdateSelectedStatuses}
              disabled={!selectedPayoutIds.length || isUpdatingStatus}
              className="w-full rounded bg-blue-600 px-3 py-2.25 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
            >
              {isUpdatingStatus
                ? 'Atualizando...'
                : `Atualizar selecionados (${selectedPayoutIds.length})`}
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={!payoutData?.length}
              className="w-full rounded bg-emerald-600 px-3 py-2.25 text-sm text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
            >
              Exportar Excel
            </button>
            <button
              type="button"
              onClick={handleOpenInvoice}
              disabled={!payoutData?.length}
              className="flex w-full items-center justify-center gap-2 rounded bg-black px-3 py-2.25 text-sm font-semibold text-white shadow-md transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
            >
              <FileDown size={16} /> Exportar PDF
            </button>
          </div>
          <div className="mx-3 flex flex-col justify-center rounded-lg border-gray-300 text-sm md:border sm:mx-4">
            <div className="hidden grid-cols-[40px_56px_2fr_2fr_1fr_1fr_1fr_1fr] bg-gray-300 px-4 py-2 font-semibold md:grid">
              <input
                type="checkbox"
                checked={Boolean(
                  payoutData?.length && selectedPayoutIds.length === payoutData.length,
                )}
                onChange={handleToggleSelectAll}
                aria-label="Selecionar todos os pagamentos"
                className="h-4 w-4 cursor-pointer"
              />
              <p>ID</p>
              <p>Proposta</p>
              <p>Colaborador</p>
              <p>RE</p>
              <p>Data</p>
              <p>Valor</p>
              <p>Status</p>
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
      <Modal isOpen={isPdfPreviewOpen} onClose={() => setIsPdfPreviewOpen(false)}>
        <div className="flex flex-col gap-4 pt-2 lg:flex-row w-300">
          <section className="flex w-full flex-col gap-4 lg:w-64 lg:pt-2">
            <div>
              <p className="text-xl font-semibold text-gray-900">Comprovante</p>
              <p className="mt-1 text-sm text-gray-500">Revise os campos e baixe o documento.</p>
            </div>
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              {[
                ['ID', exportShowId, setExportShowId],
                ['Colaborador', exportShowName, setExportShowName],
                ['RE', exportShowRE, setExportShowRE],
                ['Proposta', exportShowProposal, setExportShowProposal],
                ['Valor', exportShowPaymentValue, setExportShowPaymentValue],
                ['Campos de assinatura', exportShowSignatureFields, setExportShowSignatureFields],
                ['Status', exportShowStatus, setExportShowStatus],
              ].map(([label, checked, setChecked]) => (
                <label
                  key={label as string}
                  className="group flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2 text-sm text-gray-700 transition-colors hover:bg-white"
                >
                  <span>{label as string}</span>
                  <input
                    type="checkbox"
                    checked={checked as boolean}
                    onChange={() => (setChecked as (value: boolean) => void)(!(checked as boolean))}
                    aria-label={`Exibir ${label as string}`}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="relative h-6 w-11 shrink-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-black peer-focus-visible:ring-2 peer-focus-visible:ring-gray-500 peer-focus-visible:ring-offset-2"
                  >
                    <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                  </span>
                </label>
              ))}
            </div>
            <PDFDownloadLink
              document={invoiceDocument}
              fileName={`comprovante-pagamento-${invoiceDate.toISOString().slice(0, 10)}.pdf`}
              className="flex items-center justify-center gap-2 rounded bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              {({ loading }) => (
                <>
                  <FileDown size={16} /> {loading ? 'Preparando PDF...' : 'Baixar PDF'}
                </>
              )}
            </PDFDownloadLink>
          </section>
          <div className="h-[70vh] min-h-130 flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-gray-100 p-3 shadow-inner sm:p-5">
            <PayoutInvoicePreview
              payouts={invoicePayouts}
              issuedAt={invoiceDate}
              showId={exportShowId}
              showName={exportShowName}
              showRE={exportShowRE}
              showProposal={exportShowProposal}
              showPaymentValue={exportShowPaymentValue}
              showStatus={exportShowStatus}
              showSignatureFields={exportShowSignatureFields}
            />
          </div>
        </div>
      </Modal>
    </>
  )
}

export default PayoutList
