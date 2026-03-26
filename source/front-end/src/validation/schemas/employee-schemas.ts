import z from 'zod'

export const createEmployeeSchema = z.object({
  name: z.string(),
  re: z.coerce
    .number('O campo deve ser preenchido com um número.')
    .int()
    .positive('RE deve ser um número inteiro positivo'),
  role: z.string(),
  shift: z.string(),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caractéres.'),
})
