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
  const adjustedDate = new Date(date.valueOf() + offsetInMinutes * 60 * 1000)
  return adjustedDate
}
