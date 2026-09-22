import cron from 'node-cron'
import { sendEmail } from '../services/email-service'
import { makeEmployeeUseCase } from '../factories/make-employee-use-case.factory'
import { buildEmailWithEmployeeInformation } from '../utils/templates/email-templates'

const url = process.env.CORS_ORIGIN

export async function startEmailJob() {
  cron.schedule('0 8 * * 1', async () => {
    try {
      const employeeUseCase = makeEmployeeUseCase()
      const employees = await employeeUseCase.executeFindAllWithUnansweredProposals()
      for (const employee of employees) {
        if (!employee.email || !url) continue
        await sendEmail({
          to: employee.email,
          subject: 'Sugestões Abertas - ePIC 💡',
          html: buildEmailWithEmployeeInformation(employee, url),
        })
      }
    } catch (error) {
      console.error('Error sending emails:', error)
    }
  })
}
