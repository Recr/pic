import z from 'zod'

export const createCategory = z.object({
  body: z.object({
    name: z.string().min(3).max(50, 'O nome da categoria deve ter no máximo 50 caracteres.'),
    categoryReward: z.number().optional(),
  }),
})

export const getCategoryById = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
})

export const deleteCategory = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
})

export const updateCategory = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
  body: z.object({
    name: z.string(),
    categoryReward: z.number().optional(),
  }),
})
