export interface CreateEmployeeInput{
  name: string, 
  re: number,
  role: Role,
  shift: string,
  password: string
}

enum Role {
  ADMIN,
  OPERATOR,
  LEADER,
  MANAGER,
  GENERAL_MANAGER,
  TECHNICAL_SUPPORT,
  HUMAN_RESOURCES
}

