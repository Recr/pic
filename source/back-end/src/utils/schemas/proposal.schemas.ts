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
      employees: z
        .object({
          re: z.number().positive(),
          name: z.string(),
          shift: z.string(),
        })
        .array()
        .max(3, 'The max employees per proposal is 3.')
        .nonempty(),
      areaId: z.number(),
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

export const updateProposalStatusByChampionSchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
  body: z.object({
    status: z.enum([
      'TO_IMPLEMENT',
      'REJECTED',
      'UNDER_VALIDATION',
      'NOT_VIABLE',
      'IMPLEMENTATION',
      'IMPLEMENTED',
    ]),
  }),
})
