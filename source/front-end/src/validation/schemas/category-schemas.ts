import z from 'zod'

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(3, 'O nome da categoria deve ter pelo menos 3 caracteres.')
    .max(50, 'O nome da categoria deve ter no máximo 50 caracteres.'),
  categoryReward: z.coerce.number().optional(),
})

export const updateCategorySchema = createCategorySchema
