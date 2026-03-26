import { z } from 'zod'

export const loginSchema = z.object({
  re: z.coerce
    .number('O campo deve ser preenchido com um número.')
    .int()
    .positive('RE deve ser um número inteiro positivo'),
  password: z.string().nonempty('O campo deve ser preenchido.'),
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

export const resetPasswordSchema = z
  .object({
    re: z.coerce
      .number('O campo deve ser preenchido com um número.')
      .int()
      .positive('RE deve ser um número inteiro positivo'),
    passwordToken: z.coerce
      .number('O campo deve ser preenchido com um número.')
      .int()
      .positive('O token de recuperação deve ser um número inteiro positivo')
      .max(999999, 'O token de recuperação deve ser um número de seis dígitos.')
      .min(100000, 'O token de recuperação deve ser um número de seis dígitos.'),
    newPassword: z.string().min(8, 'A nova senha deve ter no mínimo 8 caractéres.'),
    confirmPassword: z.string().min(8, 'A confirmação de senha deve ter no mínimo 8 caractéres.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

export const requestTokenSchema = z.object({
  re: z.coerce
    .number('O campo deve ser preenchido com um número.')
    .int()
    .positive('RE deve ser um número inteiro positivo'),
})
