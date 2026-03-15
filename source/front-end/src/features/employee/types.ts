export interface Employee {
  re: number
  name: string
  role: string
  shift?: string
}

export interface CreateEmployee extends Employee {
  password: string
}
