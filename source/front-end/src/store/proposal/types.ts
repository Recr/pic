export interface Employee {
    re: number;
    name: string;
    shift: string;
}

export interface Proposal {
    id?: number;
    employees: Employee[];
    areaId: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateProposalRequest {
    description: string;
    employeeRes: number[];
    areaId: number;
}

export interface UpdateProposalRequest {
    id: string;
    status?: 'pending' | 'approved' | 'rejected' | 'implemented';
    employees?: Employee[];
    area?: string;
    suggestion?: string;
}