import z from 'zod'

export const proposalIdSchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
})

export const createProposalSchema = z.object({
  body: z
    .object({
      description: z.string().max(1000, 'A sugestão deve ter no máximo 1000 caracteres.'),
      employees: z
        .object({
          re: z.number().positive(),
          name: z.string().nonempty(),
          shift: z.string().nonempty(),
        })
        .array()
        .max(3, 'The max employees per proposal is 3.')
        .nonempty()
        .refine(
          (employees) =>
            new Set(employees.map((employee) => employee.re)).size === employees.length,
          { message: 'Employees list contains duplicated RE.' },
        ),
      areaId: z.number(),
    })
    .strict(),
})

export const updateProposalWithChampion = z.object({
  body: z.object({
    championRe: z.number(),
    managerNotes: z.string().max(1000).optional(),
  }),
  params: z.object({
    id: z.coerce.number(),
  }),
})

export const adminUpdateProposalWithChampion = z.object({
  body: z.object({
    areaId: z.number(),
    championRe: z.number(),
    categoryId: z.number(),
    isCustomReward: z.boolean(),
  }),
  params: z.object({
    id: z.coerce.number(),
  }),
})

export const updateProposalWithManager = z.object({
  body: z.object({
    areaId: z.number(),
    managerRe: z.number(),
    categoryId: z.number(),
    isCustomReward: z.boolean(),
  }),
  params: z.object({
    id: z.coerce.number(),
  }),
})

export const updateProposalStatusByChampionSchema = z
  .object({
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
      customRewardAmount: z.coerce.number().positive().optional(),
      rejectionNote: z.string().max(1000).optional(),
    }),
  })
  .superRefine(({ body }, ctx) => {
    if (
      (body.status === 'REJECTED' || body.status === 'NOT_VIABLE') &&
      !body.rejectionNote?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['body', 'rejectionNote'],
        message: 'Rejection note is required when status is REJECTED or NOT_VIABLE.',
      })
    }
  })

export const updateProposalNotesByChampionSchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
  body: z.object({
    notes: z.string().max(1000).optional(),
  }),
})

export const adminRejectionSchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
  query: z.object({
    rejectionNote: z.string().trim().min(1, 'Rejection note is required.').max(1000),
  }),
})

export const softDeleteProposalSchema = proposalIdSchema

export const restoreProposalSchema = proposalIdSchema

export const updateProposalManager = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
  body: z.object({
    managerRe: z.number(),
  }),
})

export const updateProposalChampion = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
  body: z.object({
    championRe: z.number(),
  }),
})
