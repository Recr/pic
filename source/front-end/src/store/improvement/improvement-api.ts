import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { CreateImprovementRequest, Improvement } from './types';

const BASE_URL = import.meta.env.VITE_API_URL

export const improvementAPI = createApi({
    reducerPath: 'improvement-api',
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
})