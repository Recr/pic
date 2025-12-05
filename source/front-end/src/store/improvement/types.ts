export interface Employee {
    re: number;
    name: string;
    shift: string;
}

export interface Improvement {
    id?: number;
    employees: Employee[];
    area: string;
    suggestion: string;
    status?: 'pending' | 'approved' | 'rejected' | 'implemented';
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateImprovementRequest {
    employees: Employee[];
    areaId: number;
    description: string;
    date: string;
}

export interface UpdateImprovementRequest {
    id: string;
    status?: 'pending' | 'approved' | 'rejected' | 'implemented';
    employees?: Employee[];
    area?: string;
    suggestion?: string;
}