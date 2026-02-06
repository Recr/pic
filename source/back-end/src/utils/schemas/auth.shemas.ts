import z from 'zod'

export const loginSchema = z.object({
  body: z
    .object({
      re: z.coerce.number(),
      password: z.string(),
    })
    .strict(),
})
