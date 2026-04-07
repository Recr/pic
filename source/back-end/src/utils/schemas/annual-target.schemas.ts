import z from 'zod'

export const createAnnualTargetSchema = z.object({
  body: z.object({
    annualSubmittedProposalsTarget: z.number().int().positive(),
    annualImplementedProposalsTarget: z.number().int().positive(),
    annualHeadCount: z.number().int().positive(),
    communicationDaysTarget: z.number().int().positive(),
    year: z.number().int().min(2000).max(2100),
  }),
})

export const yearParamSchema = z.object({
  params: z.object({
    year: z.coerce.number().int().min(2000).max(2100),
  }),
})

export const updateAnnualTargetSchema = yearParamSchema.extend({
  body: z.object({
    year: z.number().int().min(2000).max(2100).optional(),
    annualSubmittedProposalsTarget: z.number().int().positive().optional(),
    annualImplementedProposalsTarget: z.number().int().positive().optional(),
    annualHeadCount: z.number().int().positive().optional(),
    communicationDaysTarget: z.number().int().positive().optional(),
  }),
})
