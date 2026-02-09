import { z } from 'zod'

export const loginSchema = z.object({
  re: z.string().min(1, 'RE é obrigatório').regex(/^\d+$/, 'Deve ser um número válido'),
  password: z.string().min(4, 'Mínimo de 4 carácteres'),
})
