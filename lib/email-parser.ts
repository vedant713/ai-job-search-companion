import { google } from "googleapis"
import nodemailer from "nodemailer"

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
)

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify"
]

export interface ParsedApplication {
  id: string
  company: string
  role: string
  status: "Applied" | "Interviewing" | "Offer" | "Rejected" | "Saved"
  date_applied?: string
  notes?: string
  job_url?: string
  salary_range?: string
  location?: string
  source: "email"
  email_subject?: string
  email_from?: string
  email_date?: string
}

export interface EmailMessage {
  id: string
  subject: string
  from: string
  date: string
  body: string
  snippet: string
}

export function getAuthUrl(clientId?: string, clientSecret?: string): string {
  const oauth2Client = new google.auth.OAuth2(
    clientId || process.env.GMAIL_CLIENT_ID,
    clientSecret || process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  )
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent"
  })
}

export async function getTokenFromCode(code: string, clientId?: string, clientSecret?: string): Promise<string> {
  const oauth2Client = new google.auth.OAuth2(
    clientId || process.env.GMAIL_CLIENT_ID,
    clientSecret || process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  )
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)
  return tokens.access_token!
}

export function setAccessToken(token: string): void {
  oauth2Client.setCredentials({ access_token: token })
}

export async function getGmailClient(accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken })
  return google.gmail({ version: "v1", auth: oauth2Client })
}

const JOB_SITE_QUERIES = {
  linkedin: 'subject:"applied for" OR from:linkedin.com',
  indeed: '(subject:indeed AND (subject:apply OR subject:application OR subject:applied))',
  glassdoor: '(subject:glassdoor AND (subject:application OR subject:applied))',
  greenhouse: '(subject:greenhouse AND (subject:application OR subject:applied))',
  lever: '(subject:lever AND (subject:application OR subject:applied))'
}

function buildSearchQuery(): string {
  const queries = Object.values(JOB_SITE_QUERIES)
  return queries.join(" OR ")
}

export async function searchJobEmails(accessToken: string, maxResults = 50): Promise<EmailMessage[]> {
  const gmail = await getGmailClient(accessToken)
  const query = buildSearchQuery()
  
  const response = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults
  })

  const messages = response.data.messages || []
  const emails: EmailMessage[] = []

  for (const msg of messages) {
    const full = await gmail.users.messages.get({
      userId: "me",
      id: msg.id!,
      format: "full"
    })

    const headers = full.data.payload?.headers || []
    const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value

    const subject = getHeader("Subject") || ""
    const from = getHeader("From") || ""
    const date = getHeader("Date") || ""

    let body = ""
    if (full.data.payload?.parts) {
      for (const part of full.data.payload.parts) {
        if (part.body?.data) {
          body += Buffer.from(part.body.data, "base64").toString("utf-8")
        }
      }
    } else if (full.data.payload?.body?.data) {
      body = Buffer.from(full.data.payload.body.data, "base64").toString("utf-8")
    }

    emails.push({
      id: msg.id!,
      subject,
      from,
      date,
      body,
      snippet: full.data.snippet || ""
    })
  }

  return emails
}

export function parseLinkedInEmail(email: EmailMessage): Partial<ParsedApplication> | null {
  const { subject, body } = email
  
  if (!subject.toLowerCase().includes("applied") && !email.from.toLowerCase().includes("linkedin.com")) {
    return null
  }

  const result: Partial<ParsedApplication> = {
    source: "email",
    email_subject: subject,
    email_from: email.from,
    email_date: email.date
  }

  const companyMatch = subject.match(/application to (.+?) for /i) || body.match(/company[:\s]+(.+?)(?:\n|$)/i)
  if (companyMatch) result.company = companyMatch[1].trim()

  const roleMatch = subject.match(/for (.+?)(?:\"|$)/i) || body.match(/role[:\s]+(.+?)(?:\n|$)/i)
  if (roleMatch) result.role = roleMatch[1].trim()

  const dateMatch = body.match(/applied on ([A-Z][a-z]+ \d{1,2},?\s*\d{4})/i) ||
                    body.match(/date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
  if (dateMatch) {
    const parsed = new Date(dateMatch[1])
    if (!isNaN(parsed.getTime())) result.date_applied = parsed.toISOString()
  }

  const urlMatch = body.match(/https?:\/\/[^\s<>"]+\/(?:jobs|positions|apply)[^\s<>"]*/i)
  if (urlMatch) result.job_url = urlMatch[0]

  const locationMatch = body.match(/location[:\s]+(.+?)(?:\n|$)/i)
  if (locationMatch) result.location = locationMatch[1].trim()

  return result.company || result.role ? result : null
}

export function parseIndeedEmail(email: EmailMessage): Partial<ParsedApplication> | null {
  const { subject, body } = email
  
  if (!subject.toLowerCase().includes("indeed")) {
    return null
  }

  const result: Partial<ParsedApplication> = {
    source: "email",
    email_subject: subject,
    email_from: email.from,
    email_date: email.date
  }

  const roleMatch = subject.match(/Indeed Apply:\s*(.+?)\s*at/i) || body.match(/position[:\s]+(.+?)(?:\n|$)/i)
  if (roleMatch) result.role = roleMatch[1].trim()

  const companyMatch = subject.match(/at\s+(.+?)(?:\"|$)/i) || body.match(/company[:\s]+(.+?)(?:\n|$)/i)
  if (companyMatch) result.company = companyMatch[1].trim()

  const dateMatch = body.match(/applied on ([A-Z][a-z]+ \d{1,2},?\s*\d{4})/i) ||
                    body.match(/date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
  if (dateMatch) {
    const parsed = new Date(dateMatch[1])
    if (!isNaN(parsed.getTime())) result.date_applied = parsed.toISOString()
  }

  const urlMatch = body.match(/https?:\/\/[^\s<>"]+\.indeed\.com[^\s<>"]*/i) ||
                   body.match(/https?:\/\/[^\s<>"]+\/(?:jobs|apply)[^\s<>"]*/i)
  if (urlMatch) result.job_url = urlMatch[0]

  const salaryMatch = body.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*\/year)?/i)
  if (salaryMatch) result.salary_range = salaryMatch[0]

  const locationMatch = body.match(/location[:\s]+(.+?)(?:\n|$)/i) || body.match(/(?:remote|hybrid|on-site)[:\s]*(.+?)(?:\n|$)/i)
  if (locationMatch) result.location = locationMatch[1].trim()

  return result.company || result.role ? result : null
}

export function parseGlassdoorEmail(email: EmailMessage): Partial<ParsedApplication> | null {
  const { subject, body } = email
  
  if (!subject.toLowerCase().includes("glassdoor")) {
    return null
  }

  const result: Partial<ParsedApplication> = {
    source: "email",
    email_subject: subject,
    email_from: email.from,
    email_date: email.date
  }

  const companyMatch = subject.match(/at\s+(.+?)(?:\"|$)/i) || body.match(/company[:\s]+(.+?)(?:\n|$)/i)
  if (companyMatch) result.company = companyMatch[1].trim()

  const roleMatch = subject.match(/Application[:\s]*(.+?)\s*at/i) || body.match(/position[:\s]+(.+?)(?:\n|$)/i)
  if (roleMatch) result.role = roleMatch[1].trim()

  const dateMatch = body.match(/applied on ([A-Z][a-z]+ \d{1,2},?\s*\d{4})/i) ||
                    body.match(/date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
  if (dateMatch) {
    const parsed = new Date(dateMatch[1])
    if (!isNaN(parsed.getTime())) result.date_applied = parsed.toISOString()
  }

  const urlMatch = body.match(/https?:\/\/[^\s<>"]+\.glassdoor\.com[^\s<>"]*/i)
  if (urlMatch) result.job_url = urlMatch[0]

  const locationMatch = body.match(/location[:\s]+(.+?)(?:\n|$)/i)
  if (locationMatch) result.location = locationMatch[1].trim()
  else if (body.toLowerCase().includes("remote")) result.location = "Remote"

  return result.company || result.role ? result : null
}

export function parseGreenhouseEmail(email: EmailMessage): Partial<ParsedApplication> | null {
  const { subject, body } = email
  
  if (!subject.toLowerCase().includes("greenhouse")) {
    return null
  }

  const result: Partial<ParsedApplication> = {
    source: "email",
    email_subject: subject,
    email_from: email.from,
    email_date: email.date
  }

  const companyMatch = body.match(/company[:\s]+(.+?)(?:\n|$)/i)
  if (companyMatch) result.company = companyMatch[1].trim()

  const roleMatch = body.match(/application for (.+?)(?:\n|$)/i) || body.match(/position[:\s]+(.+?)(?:\n|$)/i)
  if (roleMatch) result.role = roleMatch[1].trim()

  const dateMatch = body.match(/applied on ([A-Z][a-z]+ \d{1,2},?\s*\d{4})/i) ||
                    body.match(/date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
  if (dateMatch) {
    const parsed = new Date(dateMatch[1])
    if (!isNaN(parsed.getTime())) result.date_applied = parsed.toISOString()
  }

  const urlMatch = body.match(/https?:\/\/[^\s<>"]+\.greenhouse\.io[^\s<>"]*/i) ||
                   body.match(/https?:\/\/[^\s<>"]+\/(?:jobs|applications)[^\s<>"]*/i)
  if (urlMatch) result.job_url = urlMatch[0]

  const locationMatch = body.match(/location[:\s]+(.+?)(?:\n|$)/i)
  if (locationMatch) result.location = locationMatch[1].trim()

  return result.company || result.role ? result : null
}

export function parseLeverEmail(email: EmailMessage): Partial<ParsedApplication> | null {
  const { subject, body } = email
  
  if (!subject.toLowerCase().includes("lever")) {
    return null
  }

  const result: Partial<ParsedApplication> = {
    source: "email",
    email_subject: subject,
    email_from: email.from,
    email_date: email.date
  }

  const companyMatch = body.match(/company[:\s]+(.+?)(?:\n|$)/i)
  if (companyMatch) result.company = companyMatch[1].trim()

  const roleMatch = body.match(/application for (.+?)(?:\n|$)/i) || body.match(/position[:\s]+(.+?)(?:\n|$)/i)
  if (roleMatch) result.role = roleMatch[1].trim()

  const dateMatch = body.match(/applied on ([A-Z][a-z]+ \d{1,2},?\s*\d{4})/i) ||
                    body.match(/date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
  if (dateMatch) {
    const parsed = new Date(dateMatch[1])
    if (!isNaN(parsed.getTime())) result.date_applied = parsed.toISOString()
  }

  const urlMatch = body.match(/https?:\/\/[^\s<>"]+\.lever\.co[^\s<>"]*/i) ||
                   body.match(/https?:\/\/[^\s<>"]+\/(?:jobs|apply)[^\s<>"]*/i)
  if (urlMatch) result.job_url = urlMatch[0]

  const locationMatch = body.match(/location[:\s]+(.+?)(?:\n|$)/i)
  if (locationMatch) result.location = locationMatch[1].trim()

  return result.company || result.role ? result : null
}

export function parseGenericEmail(email: EmailMessage): Partial<ParsedApplication> | null {
  const { subject, body } = email

  const result: Partial<ParsedApplication> = {
    source: "email",
    email_subject: subject,
    email_from: email.from,
    email_date: email.date
  }

  const companyPatterns = [
    /company[:\s]+(.+?)(?:\n|$)/i,
    /applied to (.+?)(?:\n|for)/i,
    /application at (.+?)(?:\n|$)/i
  ]
  for (const pattern of companyPatterns) {
    const match = body.match(pattern)
    if (match) {
      result.company = match[1].trim()
      break
    }
  }

  const rolePatterns = [
    /role[:\s]+(.+?)(?:\n|$)/i,
    /position[:\s]+(.+?)(?:\n|$)/i,
    /job title[:\s]+(.+?)(?:\n|$)/i
  ]
  for (const pattern of rolePatterns) {
    const match = body.match(pattern)
    if (match) {
      result.role = match[1].trim()
      break
    }
  }

  const datePatterns = [
    /applied on ([A-Z][a-z]+ \d{1,2},?\s*\d{4})/i,
    /application date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
  ]
  for (const pattern of datePatterns) {
    const match = body.match(pattern)
    if (match) {
      const parsed = new Date(match[1])
      if (!isNaN(parsed.getTime())) {
        result.date_applied = parsed.toISOString()
        break
      }
    }
  }

  const urlPatterns = [
    /https?:\/\/[^\s<>"]+\.workday\.com[^\s<>"]*/i,
    /https?:\/\/[^\s<>"]+\/(?:jobs|positions|apply|details)[^\s<>"]*/i
  ]
  for (const pattern of urlPatterns) {
    const match = body.match(pattern)
    if (match) {
      result.job_url = match[0]
      break
    }
  }

  const salaryPatterns = [
    /\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*\/year|\s*k)?/i
  ]
  for (const pattern of salaryPatterns) {
    const match = body.match(pattern)
    if (match) {
      result.salary_range = match[0]
      break
    }
  }

  const locationPatterns = [
    /location[:\s]+(.+?)(?:\n|$)/i,
    /(?:remote|hybrid|on-site|onsite)[:\s]*(.+?)(?:\n|$)/i
  ]
  for (const pattern of locationPatterns) {
    const match = body.match(pattern)
    if (match) {
      result.location = match[1].trim()
      break
    }
  }
  if (!result.location && body.toLowerCase().includes("remote")) {
    result.location = "Remote"
  }

  return result.company || result.role ? result : null
}

export function parseEmail(email: EmailMessage): ParsedApplication | null {
  const parsers = [
    parseLinkedInEmail,
    parseIndeedEmail,
    parseGlassdoorEmail,
    parseGreenhouseEmail,
    parseLeverEmail,
    parseGenericEmail
  ]

  for (const parser of parsers) {
    const result = parser(email)
    if (result && (result.company || result.role)) {
      return {
        id: email.id,
        company: result.company || "Unknown Company",
        role: result.role || "Unknown Role",
        status: "Applied",
        date_applied: result.date_applied,
        notes: result.notes,
        job_url: result.job_url,
        salary_range: result.salary_range,
        location: result.location,
        source: "email",
        email_subject: result.email_subject,
        email_from: result.email_from,
        email_date: result.email_date
      }
    }
  }

  return null
}

export async function parseAllEmails(accessToken: string): Promise<ParsedApplication[]> {
  const emails = await searchJobEmails(accessToken)
  const applications: ParsedApplication[] = []

  for (const email of emails) {
    const parsed = parseEmail(email)
    if (parsed) {
      applications.push(parsed)
    }
  }

  return applications
}
