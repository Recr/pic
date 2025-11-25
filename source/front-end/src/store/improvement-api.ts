import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base URL for your API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

// Define types for your improvement data
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

export const improvementApi = createApi({
    reducerPath: 'improvementApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            // Add any auth tokens or custom headers here
            const token = localStorage.getItem('authToken');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Improvement'],
    endpoints: (builder) => ({
        createImprovement: builder.mutation<Improvement, CreateImprovementRequest>({
            query: (body) => ({
                url: '/improvements',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Improvement'],
        }),
    }),
});

export const { useCreateImprovementMutation } = improvementApi;

export default improvementApi;