import z from "zod";

export const createCategory = z.object({
  body: z.object({
    name: z.string(),
    categoryReward: z.number().optional()
  })
})

export const getCategoryById = z.object({
  params: z.object({
    id: z.coerce.number()
  })
})

export const deleteCategory = z.object({
  params: z.object({
    id: z.coerce.number()
  })
})

export const updateCategory = z.object({
  params: z.object({
    id: z.coerce.number()
  }),
  body: z.object({
    name: z.string(),
    categoryReward: z.number().optional()
  })
})