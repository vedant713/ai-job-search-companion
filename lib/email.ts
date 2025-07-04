// Email Integration using Resend API
interface EmailTemplate {
  to: string
  subject: string
  html: string
}

interface FollowUpEmailData {
  companyName: string
  recruiterName: string
  position: string
  interviewDate?: string
  type: "thank-you" | "follow-up" | "status-check"
}

export class EmailService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async sendFollowUpEmail(data: FollowUpEmailData): Promise<boolean> {
    try {
      const template = this.generateEmailTemplate(data)

      // In production, use Resend API
      /*
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'noreply@yourapp.com',
          to: template.to,
          subject: template.subject,
          html: template.html,
        }),
      })
      */

      // Simulate email sending
      console.log("Email sent:", template)
      return true
    } catch (error) {
      console.error("Email sending failed:", error)
      return false
    }
  }

  private generateEmailTemplate(data: FollowUpEmailData): EmailTemplate {
    const templates = {
      "thank-you": {
        subject: `Thank you for the ${data.position} interview - ${data.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Thank You</h2>
            <p>Dear ${data.recruiterName},</p>
            <p>Thank you for taking the time to interview me for the ${data.position} position at ${data.companyName}. I enjoyed our conversation and learning more about the team and company culture.</p>
            <p>I'm very excited about the opportunity to contribute to ${data.companyName} and believe my skills would be a great fit for this role.</p>
            <p>Please let me know if you need any additional information from me. I look forward to hearing about the next steps.</p>
            <p>Best regards,<br>Your Name</p>
          </div>
        `,
      },
      "follow-up": {
        subject: `Following up on ${data.position} application - ${data.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Following Up</h2>
            <p>Dear ${data.recruiterName},</p>
            <p>I hope this email finds you well. I wanted to follow up on my application for the ${data.position} position at ${data.companyName}.</p>
            <p>I remain very interested in this opportunity and would welcome the chance to discuss how my experience can contribute to your team.</p>
            <p>Thank you for your time and consideration.</p>
            <p>Best regards,<br>Your Name</p>
          </div>
        `,
      },
      "status-check": {
        subject: `Checking on application status - ${data.position} at ${data.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Application Status Inquiry</h2>
            <p>Dear ${data.recruiterName},</p>
            <p>I hope you're doing well. I wanted to check on the status of my application for the ${data.position} position at ${data.companyName}.</p>
            <p>I'm still very interested in this role and would appreciate any updates you might have.</p>
            <p>Thank you for your time.</p>
            <p>Best regards,<br>Your Name</p>
          </div>
        `,
      },
    }

    return {
      to: `${data.recruiterName.toLowerCase().replace(" ", ".")}@${data.companyName.toLowerCase()}.com`,
      ...templates[data.type],
    }
  }
}

export const emailService = new EmailService(process.env.RESEND_API_KEY || "demo-key")
