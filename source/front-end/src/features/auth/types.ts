export interface User {
  id: number
  name: string
  role: Role
  re: number
  shift: string
  mustChangePassword: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type Role =
  | 'OPERATOR'
  | 'TEAM_LEADER'
  | 'SUPERVISOR'
  | 'MANAGER'
  | 'GENERAL_MANAGER'
  | 'ADMIN'
  | 'HUMAN_RESOURCES'
  | 'TECHNICAL_SUPPORT'
