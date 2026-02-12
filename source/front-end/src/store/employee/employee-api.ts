import type { Employee, CreateEmployee } from './types'
import { api } from '../api'

export const employeeAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], void>({
      query: () => '/employees',
      providesTags: ['Employee'],
    }),
    createEmployee: builder.mutation<CreateEmployee, Employee>({
      query: (body) => ({
        url: '/employees',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Employee'],
    }),
  }),
})
