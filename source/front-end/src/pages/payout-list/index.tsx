import { useEffect, useRef, useState } from 'react'
import { FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as pdfjsLib from 'pdfjs-dist'
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

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

type PdfPreviewProps = {
  url: string
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ url }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const loadingTask = pdfjsLib.getDocument({ url })

    setError(false)
    loadingTask.promise
      .then(async (pdf) => {
        const container = containerRef.current
        if (!container || cancelled) return

        container.replaceChildren()

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber)
          if (cancelled) return

          const viewport = page.getViewport({ scale: 1.25 })
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          if (!context) return

          canvas.width = viewport.width
          canvas.height = viewport.height
          canvas.className = 'mx-auto mb-4 block max-w-full shadow-md  overflow-scroll'
          container.appendChild(canvas)

          await page.render({ canvas, canvasContext: context, viewport }).promise
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
      void loadingTask.destroy()
    }
  }, [url])

  return (
    <div className="mx-4 mt-4 rounded border border-gray-200 bg-gray-100 p-4 overf">
      {error ? (
        <p className="text-sm text-red-600">Não foi possível carregar a pré-visualização.</p>
      ) : (
        <div ref={containerRef} aria-label="Pré-visualização do PDF" />
      )}
    </div>
  )
}

const PayoutList: React.FC = () => {
  const { data: payoutData, isLoading } = payoutAPI.useGetPayoutsQuery(undefined)
  const [updatePayoutStatus, { isLoading: isUpdatingStatus }] =
    payoutAPI.useUpdatePayoutStatusMutation()
  const [selectedPayoutIds, setSelectedPayoutIds] = useState<number[]>([])
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)
  const [nextStatus, setNextStatus] = useState<PayoutStatus>('PAID')
  const [pdfUrlState, setPdfUrlState] = useState<string | null>(null)

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

    const dateTag = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(workbook, `pagamentos-${dateTag}.xlsx`)
  }

  // const handleExportPdf = () => {
  //   const selectedPayouts = getSelectedOrAllPayouts()
  //   if (selectedPayouts.length === 0) return

  //   const exportDate = new Date()

  //   const formatDate = (value: string | null) =>
  //     value ? new Date(value).toLocaleDateString('pt-BR') : '-'

  //   const formatCurrency = (value: number) =>
  //     new Intl.NumberFormat('pt-BR', {
  //       style: 'currency',
  //       currency: 'BRL',
  //     }).format(value)

  //   const totalValue = selectedPayouts.reduce((acc, payout) => acc + Number(payout.value), 0)

  //   const doc = new jsPDF({
  //     orientation: 'landscape',
  //     unit: 'pt',
  //     format: 'a4',
  //   })

  //   doc.setFillColor(15, 118, 110)
  //   doc.rect(0, 0, doc.internal.pageSize.getWidth(), 84, 'F')

  //   doc.setTextColor(255, 255, 255)
  //   doc.setFontSize(20)
  //   doc.text('Relatorio de Pagamentos', 40, 36)

  //   doc.setFontSize(10)
  //   doc.text(`Gerado em ${exportDate.toLocaleString('pt-BR')}`, 40, 56)
  //   doc.text(
  //     selectedPayoutIds.length > 0 ? 'Escopo: itens selecionados' : 'Escopo: lista completa',
  //     40,
  //     70,
  //   )

  //   doc.setTextColor(35, 35, 35)
  //   doc.setFontSize(11)
  //   doc.text(`Registros: ${selectedPayouts.length}`, 40, 108)
  //   doc.text(`Valor total: ${formatCurrency(totalValue)}`, 180, 108)

  //   autoTable(doc, {
  //     startY: 122,
  //     margin: { left: 36, right: 36, bottom: 32 },
  //     head: [['ID', 'Proposta', 'Colaborador', 'RE', 'Data', 'Valor', 'Status', 'Pagamento']],
  //     body: selectedPayouts.map((payout) => [
  //       payout.id,
  //       payout.suggestion.proposal.description,
  //       payout.suggestion.employee?.name ?? payout.suggestion.employeeName,
  //       payout.suggestion.employee?.re ?? payout.suggestion.employeeRe,
  //       formatDate(payout.createdAt),
  //       formatCurrency(Number(payout.value)),
  //       statusLabels[payout.status],
  //       formatDate(payout.payedAt),
  //     ]),
  //     theme: 'grid',
  //     styles: {
  //       fontSize: 8,
  //       cellPadding: 5,
  //       textColor: [45, 45, 45],
  //       lineColor: [220, 220, 220],
  //       lineWidth: 0.5,
  //     },
  //     headStyles: {
  //       fillColor: [20, 93, 84],
  //       textColor: [255, 255, 255],
  //       fontStyle: 'bold',
  //     },
  //     alternateRowStyles: {
  //       fillColor: [247, 250, 250],
  //     },
  //     columnStyles: {
  //       0: { halign: 'center', cellWidth: 40 },
  //       1: { cellWidth: 250 },
  //       2: { cellWidth: 120 },
  //       3: { halign: 'center', cellWidth: 40 },
  //       4: { halign: 'center', cellWidth: 58 },
  //       5: { halign: 'left', cellWidth: 72 },
  //       6: { halign: 'center', cellWidth: 66 },
  //       7: { halign: 'center', cellWidth: 58 },
  //     },
  //   })

  //   const totalPages = doc.getNumberOfPages()
  //   for (let page = 1; page <= totalPages; page += 1) {
  //     doc.setPage(page)
  //     doc.setFontSize(9)
  //     doc.setTextColor(120, 120, 120)
  //     doc.text(
  //       `Pagina ${page} de ${totalPages}`,
  //       doc.internal.pageSize.getWidth() - 92,
  //       doc.internal.pageSize.getHeight() - 14,
  //     )
  //   }

  //   doc.save(`pagamentos-${exportDate.toISOString().slice(0, 10)}.pdf`)
  // }

  const handleExportPdf = () => {
    const selectedPayouts = getSelectedOrAllPayouts()
    if (selectedPayouts.length === 0) return
    const exportDate = new Date()
    const formatDate = (value: string | null) =>
      value ? new Date(value).toLocaleDateString('pt-BR') : '-'
    const formatCurrency = (value: number) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    const totalValue = selectedPayouts.reduce((acc, payout) => acc + Number(payout.value), 0)
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 40
    const contentWidth = pageWidth - margin * 2
    const primaryColor: [number, number, number] = [15, 118, 110]
    const darkColor: [number, number, number] = [35, 35, 35]
    const grayColor: [number, number, number] = [110, 110, 110]
    const lightGray: [number, number, number] = [245, 247, 247]
    const borderColor: [number, number, number] = [210, 215, 215]
    const footerHeight = 35
    // --------------------------------------------------------------------------- // HEADER // ---------------------------------------------------------------------------
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 90, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.text('PROGRAMA PIC', margin, 36)
    doc.setFontSize(14)
    doc.text('COMPROVANTE DE PAGAMENTO', margin, 60)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Emitido em ${exportDate.toLocaleString('pt-BR')}`, pageWidth - margin, 32, {
      align: 'right',
    })
    doc.text(`Documento: ${exportDate.getTime()}`, pageWidth - margin, 48, { align: 'right' })
    // --------------------------------------------------------------------------- // PAYMENT INFORMATION // ---------------------------------------------------------------------------
    let y = 120
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('INFORMAÇÕES DO PAGAMENTO', margin, y)
    y += 12
    doc.setDrawColor(...borderColor)
    doc.setFillColor(...lightGray)
    doc.roundedRect(margin, y, contentWidth, 62, 4, 4, 'FD')
    const infoY = y + 22
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...grayColor)
    doc.text('QUANTIDADE DE PAGAMENTOS', margin + 12, infoY)
    doc.text('DATA DE EMISSÃO', margin + 180, infoY)
    doc.text('STATUS', margin + 350, infoY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...darkColor)
    doc.text(`${selectedPayouts.length}`, margin + 12, infoY + 16)
    doc.text(exportDate.toLocaleDateString('pt-BR'), margin + 180, infoY + 16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text('PAGAMENTO REALIZADO', margin + 350, infoY + 16)
    y += 88
    // --------------------------------------------------------------------------- // PAYMENT TABLE // ---------------------------------------------------------------------------
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('DETALHAMENTO DOS PAGAMENTOS', margin, y)
    y += 10
    autoTable(doc, {
      startY: y,
      /*
       * Only reserve space for the normal footer.
       *
       * The signature section is NOT reserved on every page.
       * This allows the table to use almost the entire page.
       */
      margin: { left: margin, right: margin, bottom: footerHeight + 10 },
      head: [['ID', 'Colaborador', 'RE', 'Proposta', 'Pagamento', 'Valor']],
      body: selectedPayouts.map((payout) => [
        payout.id,
        payout.suggestion.employee?.name ?? payout.suggestion.employeeName,
        payout.suggestion.employee?.re ?? payout.suggestion.employeeRe,
        payout.suggestion.proposal.description,
        formatDate(payout.payedAt),
        formatCurrency(Number(payout.value)),
      ]),
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 6,
        textColor: darkColor,
        lineColor: borderColor,
        lineWidth: 0.5,
        valign: 'middle',
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: [249, 251, 251] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 38 },
        1: { cellWidth: 100 },
        2: { halign: 'center', cellWidth: 45 },
        3: { cellWidth: 190 },
        4: { halign: 'center', cellWidth: 65 },
        5: { halign: 'right', cellWidth: 75 },
      },
      showHead: 'everyPage',
    })
    // --------------------------------------------------------------------------- // DETERMINE WHERE THE TOTAL/SIGNATURES GO // ---------------------------------------------------------------------------
    const tableFinalY = (doc as any).lastAutoTable.finalY
    /*
     * Space required after the table: *
     * - 20 -> gap
     * - 50 -> total box *
     *  - 30 -> gap * - 90 -> signatures
     */ const requiredSignatureSpace = 190
    const availableSpace = pageHeight - footerHeight - tableFinalY
    /*
     * If there isn't enough room on the last table page,
     * create a clean page dedicated to the payment summary
     * and signatures.
     */
    if (availableSpace < requiredSignatureSpace) {
      doc.addPage()
    }
    // --------------------------------------------------------------------------- // TOTAL // ---------------------------------------------------------------------------
    const totalBoxWidth = 210
    const totalBoxHeight = 50
    const totalBoxX = pageWidth - margin - totalBoxWidth
    const totalBoxY =
      doc.getNumberOfPages() > 1 && doc.getCurrentPageInfo().pageNumber !== 1
        ? 55
        : tableFinalY + 20
    doc.setFillColor(...primaryColor)
    doc.roundedRect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight, 4, 4, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('VALOR TOTAL PAGO', totalBoxX + 12, totalBoxY + 18)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.text(formatCurrency(totalValue), totalBoxX + totalBoxWidth - 12, totalBoxY + 38, {
      align: 'right',
    })
    // --------------------------------------------------------------------------- // SIGNATURES // ---------------------------------------------------------------------------
    const signatureSectionTop = totalBoxY + 75
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('ASSINATURAS', margin, signatureSectionTop)
    const signatureTop = signatureSectionTop + 18
    const gap = 25
    const signatureWidth = (contentWidth - gap) / 2
    const signatures = [
      { title: 'COLABORADOR', subtitle: 'Recebedor', x: margin, y: signatureTop },
      {
        title: 'GESTOR',
        subtitle: 'Responsável pela aprovação',
        x: margin + signatureWidth + gap,
        y: signatureTop,
      },
      {
        title: 'RESPONSÁVEL PELO PIC',
        subtitle: 'Programa de sugestões',
        x: margin,
        y: signatureTop + 58,
      },
      {
        title: 'FINANCEIRO',
        subtitle: 'Responsável pelo pagamento',
        x: margin + signatureWidth + gap,
        y: signatureTop + 58,
      },
    ]
    signatures.forEach((signature) => {
      doc.setDrawColor(...borderColor)
      doc.line(signature.x, signature.y + 20, signature.x + signatureWidth, signature.y + 20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(...darkColor)
      doc.text(signature.title, signature.x, signature.y + 33)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.setTextColor(...grayColor)
      doc.text(signature.subtitle, signature.x, signature.y + 44)
    })
    // --------------------------------------------------------------------------- // FOOTER // ---------------------------------------------------------------------------
    const totalPages = doc.getNumberOfPages()
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page)
      doc.setDrawColor(...borderColor)
      doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...grayColor)
      doc.text('Programa PIC — Comprovante de Pagamento', margin, pageHeight - 20)
      doc.text(`Página ${page} de ${totalPages}`, pageWidth - margin, pageHeight - 20, {
        align: 'right',
      })
    }
    // --------------------------------------------------------------------------- // SAVE // ---------------------------------------------------------------------------
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    setPdfUrlState((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl)
      return pdfUrl
    })

    // doc.save(`comprovante-pagamento-${exportDate.toISOString().slice(0, 10)}.pdf`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
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
    <div className="min-h-screen bg-primary-gray md:px-4 md:py-8">
      <div className="rounded-xl bg-white py-4 shadow-custom ">
        <div className="mx-4 my-3 text-left text-xl font-semibold sm:my-4 sm:text-2xl">
          Lista de Pagamentos
        </div>
        {pdfUrlState && <PdfPreview url={pdfUrlState} />}
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
