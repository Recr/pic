export interface User {
  id: number
  name: string
  role: Role
  re: number
  shift: string
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
