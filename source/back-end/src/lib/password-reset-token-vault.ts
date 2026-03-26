const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

interface PasswordResetTokenEntry {
  token: string
  expiresAt: number
}

class PasswordResetTokenVault {
  private readonly entries = new Map<number, PasswordResetTokenEntry>()

  public set(employeeId: number, token: string) {
    this.entries.set(employeeId, {
      token,
      expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
    })
  }

  public get(employeeId: number): string | null {
    const entry = this.entries.get(employeeId)
    if (!entry) return null

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(employeeId)
      return null
    }

    return entry.token
  }

  public delete(employeeId: number) {
    this.entries.delete(employeeId)
  }
}

export const passwordResetTokenVault = new PasswordResetTokenVault()
