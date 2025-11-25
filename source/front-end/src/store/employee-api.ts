import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base URL for your API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

// Define types for employee data
export interface Employee {
    re: string;
    name: string;
    shift?: string;
}

export const employeeApi = createApi({
    reducerPath: 'employeeApi',
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
    tagTypes: ['Employee'],
    endpoints: (builder) => ({
        getEmployees: builder.query<Employee[], void>({
            query: () => '/employees',
            providesTags: ['Employee'],
        }),
    }),
});

export const { useGetEmployeesQuery } = employeeApi;

export default employeeApi;
