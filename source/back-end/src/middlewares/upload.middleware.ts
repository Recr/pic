import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { AppError } from '../errors/AppError'
import { StatusCodes } from 'http-status-codes'

const uploadDir = path.resolve(process.cwd(), 'uploads', 'proposal-attachments')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const filename = Buffer.from(file.originalname, 'latin1').toString('utf8').normalize('NFC')
    cb(null, `${Date.now()}-${filename}`)
  },
})

export const uploadProposalAttachment = multer({
  storage, // TODO: Use memoryStorage to store files in memory, validate with zod and then process them in the controller
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]
    const isAllowed = allowed.includes(file.mimetype)
    if (!isAllowed) {
      return cb(
        new AppError(
          'Unsupported file type. Allowed types: PDF, PNG, JPEG, DOC, DOCX, XLS, XLSX, PPT, PPTX',
          StatusCodes.BAD_REQUEST,
        ),
      )
    }
    cb(null, isAllowed)
  },
})
