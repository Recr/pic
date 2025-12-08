export interface Employee {
    re: number;
    name: string;
    shift: string;
}

export interface Improvement {
    id?: number;
    employees: Employee[];
    areaId: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateImprovementRequest {
    description: string;
    employees: Employee[];
    areaId: number;
    date: Date;
}

export interface UpdateImprovementRequest {
    id: string;
    status?: 'pending' | 'approved' | 'rejected' | 'implemented';
    employees?: Employee[];
    area?: string;
    suggestion?: string;
}