import z from 'zod'

export const proposalIdSchema = z.object({
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

export const updateProposalWithChampion = z.object({
  body: z.object({
    areaId: z.number(),
    championRe: z.number(),
    categoryId: z.number(),
  }),
  params: z.object({
    id: z.coerce.number(),
  }),
})
