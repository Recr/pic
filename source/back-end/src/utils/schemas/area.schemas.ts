import z from "zod";

export const createAreaSchema = z.object({
  body: z.object({
    name: z.string()
  })
})

export const getAreaByIdSchema = z.object({
  params: z.object({
    id: z.coerce.number()
  })
})

export const deleteAreaSchema = z.object({
  params: z.object({
    id: z.coerce.number()
  })
})

export const updateAreaSchema = z.object({
  body: z.object({
    name: z.string()
  }),
  params: z.object({
    id: z.coerce.number()
  })
})