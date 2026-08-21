import { sendEmail } from './services/email-service'

async function main() {
  const mail = {
    to: 'eliel.silva@partner.magna.com',
    subject: 'Test Email',
    html: '<h1>Hello, this is a test email!</h1><p>Funciona!</p>',
  }

  sendEmail(mail)
}

main()
