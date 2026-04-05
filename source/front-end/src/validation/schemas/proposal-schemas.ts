import z from 'zod'

export const finishProposalSchema = z.object({
  customRewardAmount: z.coerce
    .number('Valor inválido')
    .positive('O valor deve ser maior que R$ 0,00')
    .min(0.01, 'O valor deve ser maior ou igual a R$ 0,01')
    .optional(),
})
