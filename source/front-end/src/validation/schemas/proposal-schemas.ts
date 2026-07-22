import z from 'zod'

const allowedEvidenceFileExtensions = new Set([
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
])

const evidenceFilesSchema = z
  .array(z.instanceof(File, { message: 'Arquivo inválido.' }))
  .max(5, 'Você pode enviar no máximo 5 arquivos.')
  .refine(
    (files) =>
      files.every((file) => {
        const extension = file.name.split('.').pop()?.toLowerCase()
        return extension ? allowedEvidenceFileExtensions.has(extension) : false
      }),
    {
      message: 'Tipo de arquivo não permitido.',
    },
  )
  .refine((files) => files.every((file) => file.size <= 10 * 1024 * 1024), {
    message: 'Cada arquivo deve ser menor que 10MB.',
  })

const evidenceFilesInputSchema = z.preprocess((value) => {
  if (value instanceof FileList) {
    const files = Array.from(value)
    return files.length > 0 ? files : undefined
  }

  return value
}, evidenceFilesSchema.optional())

export const getFinishProposalSchema = (requireEvidenceFiles: boolean) =>
  z.object({
    customRewardAmount: z.coerce
      .number('Valor inválido')
      .positive('O valor deve ser maior que R$ 0,00.')
      .min(0.01, 'O valor deve ser maior ou igual a R$ 0,01.')
      .optional(),
    evidenceFiles: requireEvidenceFiles
      ? evidenceFilesInputSchema.refine((files) => files !== undefined, {
          message: 'Selecione um ou mais arquivos.',
        })
      : evidenceFilesInputSchema,
  })

export const getUpdateProposalWithManagerSchema = (requireEvidenceFiles: boolean) =>
  z.object({
    managerRe: z.coerce.number().int().positive('Selecione um RE valido para o gestor.'),
    areaId: z.coerce.number('Selecione uma area.').int().positive('Selecione uma area.'),
    categoryId: z.coerce
      .number('Selecione uma categoria.')
      .int()
      .positive('Selecione uma categoria.'),
    isCustomReward: z.boolean(),
    isImplemented: z.boolean(),
    customRewardAmount: z
      .number('Valor inválido')
      .positive('O valor deve ser maior que R$ 0,00.')
      .min(0.01, 'O valor deve ser maior ou igual a R$ 0,01.')
      .optional(),
    evidenceFiles: requireEvidenceFiles
      ? evidenceFilesInputSchema.refine((files) => files !== undefined, {
          message: 'Selecione um ou mais arquivos.',
        })
      : evidenceFilesInputSchema,
  })
