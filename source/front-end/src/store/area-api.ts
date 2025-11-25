import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base URL for your API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

interface Area {
    id: number,
    name: string,
}

export const areaApi = createApi({
    reducerPath: 'areaApi',
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
    tagTypes: ['Area'],
    endpoints: (builder) => ({
        getAreas: builder.query<Area[], void>({
            query: () => '/areas',
            providesTags: ['Area'],
        }),
    }),
});

export const { useGetAreasQuery } = areaApi;

export default areaApi;
