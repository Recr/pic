export type Role = "OPERATOR" | "LEADER" | "ADMIN"

export interface Employee {
    re: string;
    name: string;
    role: Role;
    shift?: string;
}