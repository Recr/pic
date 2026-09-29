import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { Payout } from '../../../features/payout/types'

type PayoutInvoiceDocumentProps = {
  payouts: Payout[]
  issuedAt: Date
  showId: boolean
  showName: boolean
  showRE: boolean
  showProposal: boolean
  showPaymentValue: boolean
  showStatus: boolean
  showSignatureFields: boolean
}

const statusLabels = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
} as const

const styles = StyleSheet.create({
  page: { backgroundColor: '#f3f3f3', color: '#202020', fontFamily: 'Helvetica', padding: 36 },
  header: { backgroundColor: '#111111', borderRadius: 10, color: '#ffffff', padding: 24 },
  headerContent: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  eyebrow: {
    color: '#cfcfcf',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  title: { fontSize: 23, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#d9d9d9', fontSize: 9 },
  headerMeta: { alignItems: 'flex-end', marginTop: 22 },
  metaLabel: {
    color: '#bdbdbd',
    fontSize: 7,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metaValue: { fontSize: 10 },
  section: { marginTop: 22 },
  sectionTitle: {
    color: '#666666',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1.1,
    marginBottom: 9,
    textTransform: 'uppercase',
  },
  summary: { flexDirection: 'row', gap: 8 },
  summaryItem: {
    backgroundColor: '#fff',
    borderColor: '#d8d8d8',
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  summaryLabel: { color: '#777777', fontSize: 7, marginBottom: 5, textTransform: 'uppercase' },
  summaryValue: { color: '#202020', fontSize: 12, fontWeight: 'bold' },
  table: {
    backgroundColor: '#fff',
    borderColor: '#d8d8d8',
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableRow: {
    alignItems: 'center',
    borderBottomColor: '#e5e5e5',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 36,
    paddingHorizontal: 10,
    width: '100%',
  },
  tableHeader: { backgroundColor: '#e4e4e4', borderBottomColor: '#cccccc' },
  cell: { color: '#333333', flex: 1, fontSize: 8, paddingRight: 6 },
  headerCell: { color: '#444444', fontSize: 7, fontWeight: 'bold', textTransform: 'uppercase' },
  valueCell: { textAlign: 'right' },
  total: { alignItems: 'flex-end', marginTop: 14 },
  totalBox: { backgroundColor: '#e1e1e1', borderRadius: 7, padding: 14, width: 190 },
  totalLabel: {
    color: '#666666',
    fontSize: 7,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  totalValue: { color: '#111111', fontSize: 16, fontWeight: 'bold' },
  signatures: { flexDirection: 'row', gap: 26, marginTop: 30 },
  signature: { borderTopColor: '#999999', borderTopWidth: 1, flex: 1, paddingTop: 7 },
  signatureTitle: { color: '#333333', fontSize: 7, fontWeight: 'bold', textTransform: 'uppercase' },
  signatureSubtitle: { color: '#777777', fontSize: 7, marginTop: 3 },
  footer: {
    borderTopColor: '#d8d8d8',
    borderTopWidth: 1,
    color: '#777777',
    flexDirection: 'row',
    fontSize: 7,
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 10,
  },
})

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const PayoutInvoiceDocument: React.FC<PayoutInvoiceDocumentProps> = ({
  payouts,
  issuedAt,
  showId,
  showName,
  showRE,
  showProposal,
  showPaymentValue,
  showStatus,
  showSignatureFields,
}) => {
  const totalValue = payouts.reduce((total, payout) => total + Number(payout.value), 0)

  return (
    <Document title="Lista de pagamentos" author="PIC">
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Programa de Incentivo a Criatividade PIC</Text>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Lista de pagamentos</Text>
            <View style={styles.headerMeta}>
              <Text style={styles.metaLabel}>Emitido em</Text>
              <Text style={styles.metaValue}>{issuedAt.toLocaleDateString('pt-BR')}</Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo da emissão</Text>
          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pagamentos</Text>
              <Text style={styles.summaryValue}>{payouts.length}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Emissão</Text>
              <Text style={styles.summaryValue}>{issuedAt.toLocaleDateString('pt-BR')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Status</Text>
              <Text style={styles.summaryValue}>Consolidado</Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens do comprovante</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]} fixed>
              {showId && <Text style={[styles.cell, styles.headerCell]}>ID</Text>}
              {showName && <Text style={[styles.cell, styles.headerCell]}>Colaborador</Text>}
              {showRE && <Text style={[styles.cell, styles.headerCell]}>RE</Text>}
              {showProposal && <Text style={[styles.cell, styles.headerCell]}>Proposta</Text>}
              {showStatus && <Text style={[styles.cell, styles.headerCell]}>Status</Text>}
              {showPaymentValue && (
                <Text style={[styles.cell, styles.headerCell, styles.valueCell]}>Valor</Text>
              )}
            </View>
            {payouts.map((payout) => (
              <View key={payout.id} style={styles.tableRow} wrap={false}>
                {showId && <Text style={styles.cell}>{payout.id}</Text>}
                {showName && (
                  <Text style={styles.cell}>
                    {payout.suggestion.employee?.name ?? payout.suggestion.employeeName}
                  </Text>
                )}
                {showRE && (
                  <Text style={styles.cell}>
                    {payout.suggestion.employee?.re ?? payout.suggestion.employeeRe}
                  </Text>
                )}
                {showProposal && (
                  <Text style={styles.cell}>{payout.suggestion.proposal.description}</Text>
                )}
                {showStatus && <Text style={styles.cell}>{statusLabels[payout.status]}</Text>}
                {showPaymentValue && (
                  <Text style={[styles.cell, styles.valueCell]}>
                    {formatCurrency(Number(payout.value))}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
        {showPaymentValue && (
          <View style={styles.total}>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Valor total</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalValue)}</Text>
            </View>
          </View>
        )}
        {showSignatureFields && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Validações</Text>
            <View style={styles.signatures}>
              <View style={styles.signature}>
                <Text style={styles.signatureTitle}>Colaborador</Text>
                <Text style={styles.signatureSubtitle}>Recebedor</Text>
              </View>
              <View style={styles.signature}>
                <Text style={styles.signatureTitle}>Financeiro</Text>
                <Text style={styles.signatureSubtitle}>Responsável pelo pagamento</Text>
              </View>
            </View>
          </View>
        )}
        <View style={styles.footer} fixed>
          <Text>Programa PIC · Documento interno</Text>
        </View>
      </Page>
    </Document>
  )
}

export default PayoutInvoiceDocument
