export type Role = "OPERATOR" | "LEADER" | "ADMIN"

export interface Employee {
    re: number;
    name: string;
    role: Role;
    shift?: string;
}

export interface CreateEmployee extends Employee {
    password: string;
}