export interface CreateEmployeeInput {
  name: string
  re: number
  role: Role
  shift: string
  password: string
}

export enum Role {
  OPERATOR = 'OPERATOR',
  TEAM_LEADER = 'TEAM_LEADER',
  LEADER = 'LEADER',
  SUPERVISOR = 'SUPERVISOR',
  MANAGER = 'MANAGER',
  GENERAL_MANAGER = 'GENERAL_MANAGER',
  TECHNICAL_SUPPORT = 'TECHNICAL_SUPPORT',
  HUMAN_RESOURCES = 'HUMAN_RESOURCES',
  ADMIN = 'ADMIN',
}
