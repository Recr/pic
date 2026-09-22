import type { StatusBadgeColor } from '../components/badges/StatusBadge'

export function getStatusColor(status: string): StatusBadgeColor {
  const translations: Record<string, StatusBadgeColor> = {
    DEFINE_CHAMPION: 'blue',
    UNDER_VALIDATION: 'orange',
    TO_IMPLEMENT: 'yellow',
    IMPLEMENTATION: 'cyan',
    REJECTED: 'red',
    NOT_VIABLE: 'gray',
    IMPLEMENTED: 'green',
    PENDING: 'orange',
    PAID: 'green',
    CANCELLED: 'red',
    WAITING_APPROVAL: 'orange',
  }
  return translations[status] || 'gray'
}

export const borderColors: Record<string, string> = {
  IMPLEMENTED: 'border-green-300',
  REJECTED: 'border-red-300',
  DEFINE_CHAMPION: 'border-blue-300',
  WAITING_APPROVAL: 'border-orange-300',
  UNDER_VALIDATION: 'border-orange-300',
  TO_IMPLEMENT: 'border-yellow-300',
  IMPLEMENTATION: 'border-cyan-300',
  NOT_VIABLE: 'border-gray-300',
  PENDING: 'border-orange-300',
  PAID: 'border-green-300',
  CANCELLED: 'border-red-300',
}
