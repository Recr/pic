import type { StatusBadgeColor } from '../components/StatusBadge'

export function getStatusColor(status: string): StatusBadgeColor {
  const translations: Record<string, StatusBadgeColor> = {
    DEFINE_CHAMPION: 'blue',
    UNDER_VALIDATION: 'orange',
    TO_IMPLEMENT: 'yellow',
    IMPLEMENTATION: 'cyan',
    REJECTED: 'red',
    NOT_VIABLE: 'gray',
    IMPLEMENTED: 'green',
  }
  return translations[status] || 'gray'
}
