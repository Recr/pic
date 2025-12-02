export interface Employee {
    re: string;
    name: string;
    shift: string;
}

export interface Improvement {
    id?: string;
    employees: Employee[];
    area: string;
    suggestion: string;
    status?: 'pending' | 'approved' | 'rejected' | 'implemented';
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateImprovementRequest {
    employees: Employee[];
    area: string;
    suggestion: string;
}

export interface UpdateImprovementRequest {
    id: string;
    status?: 'pending' | 'approved' | 'rejected' | 'implemented';
    employees?: Employee[];
    area?: string;
    suggestion?: string;
}