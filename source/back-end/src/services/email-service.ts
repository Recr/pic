import { mailTransporter } from '../lib/mail'
import dotenv from 'dotenv'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}
dotenv.config()

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  await mailTransporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  })
}
