export function translateStatus(status: string): string {
  const translations: { [key: string]: string } = {
    DEFINE_CHAMPION: 'Definir Campeão',
    REJECTED: 'Rejeitada',
    APPROVED: 'Aprovada',
  }
  return translations[status] || status
}
