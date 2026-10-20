export const getUTCStartOfDay = (date: Date): Date => {
  const utcDate = new Date(date)
  utcDate.setUTCHours(0, 0, 0, 0)
  return utcDate
}

export const getUTCEndOfDay = (date: Date): Date => {
  const utcDate = new Date(date)
  utcDate.setUTCHours(23, 59, 59, 999)
  return utcDate
}

export const adjustDateByOffset = (date: Date, offsetInMinutes: number): Date => {
  return new Date(date.valueOf() + offsetInMinutes * 60 * 1000)
}

/**
 * Converts a date-only value parsed as UTC into the start of that calendar day
 * in UTC. The offset must have the same sign as Date#getTimezoneOffset:
 * UTC - local time, for example 180 for UTC-03:00.
 */
export const getUtcStartOfLocalDay = (date: Date, offsetInMinutes: number): Date => {
  const localDayAsUtc = getUTCStartOfDay(date)
  return adjustDateByOffset(localDayAsUtc, offsetInMinutes)
}

export const getUtcEndOfLocalDay = (date: Date, offsetInMinutes: number): Date => {
  const localDayAsUtc = getUTCEndOfDay(date)
  return adjustDateByOffset(localDayAsUtc, offsetInMinutes)
}
