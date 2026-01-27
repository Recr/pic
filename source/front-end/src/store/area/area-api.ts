import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the base URL for your API
const BASE_URL = import.meta.env.VITE_API_URL;

interface Area {
  id: number;
  name: string;
}

export const areaAPI = createApi({
  reducerPath: "areaApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // Add any auth tokens or custom headers here
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Area"],
  endpoints: (builder) => ({
    getAreas: builder.query<Area[], void>({
      query: () => "/areas",
      providesTags: ["Area"],
    }),
    createArea: builder.mutation<Area, { name: string }>({
      query: (body) => ({
        url: `areas`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Area"],
    }),
    deleteArea: builder.mutation<void, number>({
      query: (areaId) => ({
        url: `/areas/${areaId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Area"],
    }),
    updateArea: builder.mutation<Area, { id: number; name: string }>({
      query: ({ id, name }) => ({
        url: `/areas/${id}`,
        method: "PUT",
        body: { name },
      }),
      invalidatesTags: ["Area"],
    }),
  }),
});
