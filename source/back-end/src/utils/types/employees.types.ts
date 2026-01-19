export interface CreateEmployeeInput{
  name: string, 
  re: number,
  role: Role,
  shift: string,
  password: string
}

enum Role {
  ADMIN = "ADMIN",
  OPERATOR = "OPERATOR",
  LEADER = "LEADER",
  MANAGER = "MANAGER",
  GENERAL_MANAGER = "GENERAL_MANAGER",
  TECHNICAL_SUPPORT = "TECHNICAL_SUPPORT",
  HUMAN_RESOURCES = "HUMAN_RESOURCES"
}

