import { z } from 'zod'

export const loginSchema = z.object({
  re: z.coerce
    .number('O campo deve ser preenchido com um número.')
    .int()
    .positive('RE deve ser um número inteiro positivo'),
  password: z.string().nonempty('O campo deve ser preenchido.'),
})
