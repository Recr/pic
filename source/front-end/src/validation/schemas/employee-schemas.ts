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

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().nonempty('Este campo é obrigatório.'),
    newPassword: z.string().min(8, 'A nova senha deve ter no mínimo 8 caractéres.'),
    confirmPassword: z.string().min(8, 'A confirmação de senha deve ter no mínimo 8 caractéres.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })
