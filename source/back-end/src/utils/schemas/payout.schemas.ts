import z from 'zod'

export const updatePayoutStatusSchema = z.object({
  body: z.object({
    ids: z.array(z.coerce.number().int().positive()).nonempty(),
    status: z.enum(['PENDING', 'PAID', 'CANCELLED']),
  }),
})
