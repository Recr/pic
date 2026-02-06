import type { StatusBadgeColor } from '../components/StatusBadge'

export function getStatusColor(status: string): StatusBadgeColor {
  const translations: Record<string, StatusBadgeColor> = {
    DEFINE_CHAMPION: 'blue',
    UNDER_VALIDATION: 'yellow',
    TO_IMPLEMENT: 'orange',
    IMPLEMENTATION: 'cyan',
    REJECTED: 'red',
    NOT_VIABLE: 'gray',
    IMPLEMENTED: 'green',
  }
  return translations[status] || 'gray'
}
