export interface Employee {
  re: number
  name: string
  role: string
  shift?: string
}

export interface UnregisteredEmployee {
  employeeRe: number
  employeeName: string
  employeeShift?: string
}

export interface CreateEmployee extends Employee {
  password: string
}
