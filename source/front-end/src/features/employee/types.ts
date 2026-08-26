export interface Employee {
  id: number
  re: number
  name: string
  role: string
  shift?: string
  email?: string
}

export interface UnregisteredEmployee {
  employeeRe: number
  employeeName: string
  employeeShift?: string
}

export interface UpdateEmployee extends Employee {
  id: number
}

export type CreateEmployee = Omit<Employee, 'id'> & {
  password: string
}

export interface PasswordResetRequester extends Employee {
  id: number
  passwordToken: string
}
