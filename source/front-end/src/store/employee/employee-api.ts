import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Employee, CreateEmployee } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL;

export const employeeAPI = createApi({
  reducerPath: "employeeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Employee"],
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], void>({
      query: () => "/employees",
      providesTags: ["Employee"],
    }),
    createEmployee: builder.mutation<Employee, CreateEmployee>({
      query: (body) => ({
        url: "/employees",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Employee"],
    }),
  }),
});
