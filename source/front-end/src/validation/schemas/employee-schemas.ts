import z from 'zod'

export const createEmployeeSchema = z.object({
  name: z.string().nonempty('O nome do colaborador é obrigatório.'),
  re: z.coerce
    .number('O campo deve ser preenchido com um número.')
    .int()
    .positive('RE deve ser um número inteiro positivo'),
  role: z.string(),
  shift: z.string('É necessário selecionar um turno.'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caractéres.'),
  email: z.email({ message: 'E-mail inválido.', pattern: z.regexes.rfc5322Email }).optional(),
})

export const updateEmployeeSchema = z.object({
  name: z.string().nonempty('O nome do colaborador é obrigatório.'),
  re: z.coerce
    .number('O campo deve ser preenchido com um número.')
    .int()
    .positive('RE deve ser um número inteiro positivo'),
  role: z.string(),
  shift: z.string('É necessário selecionar um turno.'),
  email: z.email({ message: 'E-mail inválido.', pattern: z.regexes.rfc5322Email }).optional(),
})

export const updateManagerOrChampionSchema = z.object({
  managerOrChampionRe: z.coerce
    .number('O campo deve ser preenchido com um número.')
    .int()
    .positive('RE deve ser um número inteiro positivo'),
})
