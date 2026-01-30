import z from 'zod'

export const getProposalByIdSchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
})

export const createProposalSchema = z.object({
  body: z
    .object({
      description: z.string(),
      areaId: z.number(),
      employeeRes: z.number().array().max(3, 'The max employees per proposal is 3.').nonempty(),
    })
    .strict(),
})
