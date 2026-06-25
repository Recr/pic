export function translateStatus(status: string): string {
  const translations: { [key: string]: string } = {
    DEFINE_CHAMPION: 'Definir Campeão',
    UNDER_VALIDATION: 'Em Validação',
    TO_IMPLEMENT: 'À Implementar',
    IMPLEMENTATION: 'Em Implementação',
    REJECTED: 'Rejeitado',
    NOT_VIABLE: 'Não Viável',
    IMPLEMENTED: 'Implementado',
    PENDING: 'Pendente',
    PAID: 'Pago',
    CANCELLED: 'Cancelado',
    WAITING_APPROVAL: 'Aguardando Aprovação',
  }
  return translations[status] || status
}
