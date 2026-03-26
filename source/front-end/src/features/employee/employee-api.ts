import type {
  Employee,
  CreateEmployee,
  UnregisteredEmployee,
  PasswordResetRequester,
} from './types'
import { api } from '../../services/api'

export const employeeAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], void>({
      query: () => '/employees',
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
