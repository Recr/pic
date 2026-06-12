import z from 'zod'
import { Role } from '../types/employees.types'

const ROLES = Object.values(Role) as [string, ...string[]]

export const createEmployeeSchema = z.object({
  body: z.object({
    name: z.string(),
    re: z.number().int(),
    role: z.enum(ROLES),
    shift: z.enum(['ADM', '1', '2', '3']),
    password: z.string().min(8, 'Password should have at least 8 characters').max(50),
  }),
})

export const getEmployeeByIdSchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
})

export const getEmployeeByReSchema = z.object({
  params: z.object({
    re: z.coerce.number(),
  }),
})

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
  body: z.object({
    name: z.string(),
    re: z.number().int(),
    role: z.enum(ROLES),
    shift: z.enum(['ADM', '1', '2', '3']),
  }),
})

export const deleteEmployeeSchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
})
