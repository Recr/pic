import z from 'zod'

export const loginSchema = z.object({
  body: z
    .object({
      re: z.number().int().positive('RE must be a positive integer'),
      password: z.string().min(4, 'Password must be at least 4 characters long'),
    })
    .strict(),
})

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().nonempty('Current password is required.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long.'),
  }),
})

export const requestPasswordResetTokenSchema = z.object({
  body: z.object({
    re: z.number().int().positive('RE must be a positive integer'),
  }),
})

export const resetPasswordSchema = z.object({
  body: z.object({
    re: z.number().int().positive('RE must be a positive integer'),
    passwordToken: z
      .number()
      .int()
      .positive('Password token must be a positive integer.')
      .max(999999, 'Password token must be a 6-digit number.')
      .min(100000, 'Password token must be a 6-digit number.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long.'),
  }),
})
