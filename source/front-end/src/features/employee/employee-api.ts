import type {
  Employee,
  CreateEmployee,
  UnregisteredEmployee,
  PasswordResetRequester,
  UpdateEmployee,
} from './types'
import { api } from '../../services/api'

export const employeeAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], void>({
      query: () => '/employees',
      providesTags: ['Employee'],
    }),
    getEmployeesForForms: builder.query<Employee[], void>({
      query: () => '/employees/basic-info',
      providesTags: ['Employee'],
    }),
    getUnregisteredEmployees: builder.query<UnregisteredEmployee[], void>({
      query: () => '/employees/unregistered',
      providesTags: ['Employee'],
    }),
    getPasswordResetRequesters: builder.query<PasswordResetRequester[], void>({
      query: () => '/employees/password-reset-requests',
      providesTags: ['Employee'],
    }),
    createEmployee: builder.mutation<Employee, CreateEmployee>({
      query: (body) => ({
        url: '/employees',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Employee'],
    }),
    updateEmployee: builder.mutation<Employee, UpdateEmployee>({
      query: ({ id, ...body }) => ({
        url: `/employees/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Employee'],
    }),
  }),
})
