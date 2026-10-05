import type { Payout } from '../../../features/payout/types'
import type { SignatureField } from '../types'

type PayoutInvoicePreviewProps = {
  payouts: Payout[]
  issuedAt: Date
  showId: boolean
  showName: boolean
  showRE: boolean
  showProposal: boolean
  showPaymentValue: boolean
  showStatus: boolean
  showSignatureFields: boolean
  signatureFields: SignatureField[]
  showCreationDate: boolean
}

const statusLabels = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
} as const

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const PayoutInvoicePreview: React.FC<PayoutInvoicePreviewProps> = ({
  payouts,
  issuedAt,
  showId,
  showName,
  showRE,
  showProposal,
  showPaymentValue,
  showStatus,
  showSignatureFields,
  signatureFields,
  showCreationDate,
}) => {
  const totalValue = payouts.reduce((total, payout) => total + Number(payout.value), 0)

  return (
    <article className="mx-auto min-h-280.75 w-full max-w-198.5 bg-[#f3f3f3] p-6 text-[#202020] shadow-sm sm:p-9">
      <header className="rounded-xl bg-[#111] p-6 text-white">
        <p className="mb-2 text-[10px] font-bold tracking-[0.18em] text-[#cfcfcf]">
          Programa de Incentivo a Criatividade PIC
        </p>
        <h2 className="mb-1 text-lg sm:text-2xl font-bold">Lista de pagamentos</h2>
        <div className="mt-6 text-right">
          <p className="mb-1 text-[10px] font-bold uppercase text-[#bdbdbd]">Emitido em</p>
          <p className="text-sm">{import.meta.env.VITE_PLANT}</p>
        </div>
      </header>

      <section className="mt-6">
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#666]">
          Resumo da emissão
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            ['Emissão', issuedAt.toLocaleDateString('pt-BR')],
            ['Pagamentos', payouts.length],
            ['Total', formatCurrency(totalValue)],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-md border border-[#d8d8d8] bg-white p-3">
              <p className="mb-1 text-[9px] uppercase text-[#777]">{label as string}</p>
              <p className="text-sm font-bold text-[#202020]">{value as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#666]">
          Itens
        </h3>
        <div className="overflow-x-auto rounded-md border border-[#d8d8d8] bg-white">
          <table className="w-full min-w-155 table-fixed border-collapse text-left text-[10px]">
            <thead className="bg-[#e4e4e4] text-[9px] uppercase text-[#444]">
              <tr>
                {showId && <th className="px-2 py-3 font-bold">ID</th>}
                {showName && <th className="px-2 py-3 font-bold">Colaborador</th>}
                {showRE && <th className="px-2 py-3 font-bold">RE</th>}
                {showProposal && <th className="px-2 py-3 font-bold">Proposta</th>}
                {showStatus && <th className="px-2 py-3 font-bold">Status</th>}
                {showCreationDate && <th className="px-2 py-3 font-bold">Data de criação</th>}
                {showPaymentValue && <th className="px-2 py-3 text-right font-bold">Valor</th>}
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-t border-[#e5e5e5] align-middle">
                  {showId && <td className="px-2 py-3">{payout.id}</td>}
                  {showName && (
                    <td className="px-2 py-3">
                      {payout.suggestion.employee?.name ?? payout.suggestion.employeeName}
                    </td>
                  )}
                  {showRE && (
                    <td className="px-2 py-3">
                      {payout.suggestion.employee?.re ?? payout.suggestion.employeeRe}
                    </td>
                  )}
                  {showProposal && (
                    <td className="px-2 py-3">{payout.suggestion.proposal.description}</td>
                  )}
                  {showStatus && <td className="px-2 py-3">{statusLabels[payout.status]}</td>}
                  {showCreationDate && (
                    <td className="px-2 py-3">
                      {new Date(payout.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  )}
                  {showPaymentValue && (
                    <td className="px-2 py-3 text-right">{formatCurrency(Number(payout.value))}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showSignatureFields && (
        <section className="mt-7">
          <h3 className="mb-8 text-[10px] font-bold uppercase tracking-[0.14em] text-[#666]">
            Assinaturas
          </h3>
          <div className="grid grid-cols-2 gap-7">
            {signatureFields.map((field, index) => (
              <div
                key={`${field.name}-${field.role}-${index}`}
                className="border-t border-[#999] pt-2"
              >
                <p className="text-[9px] font-bold uppercase text-[#333]">
                  {field.name || 'Assinante'}
                </p>
                <p className="mt-1 text-[9px] text-[#777]">{field.role || 'Cargo'}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-12 flex justify-between border-t border-[#d8d8d8] pt-2 text-[9px] text-[#777]">
        <span>ePIC - Programa PIC · Documento interno</span>
      </footer>
    </article>
  )
}

export default PayoutInvoicePreview
