import { NextResponse } from "next/server"
import { searchJobEmails, parseEmail } from "@/lib/email-parser"
import type { EmailMessage } from "@/lib/email-parser"

function sanitizeString(str: string | undefined | null): string {
  if (!str) return ""
  return str.replace(/[\x00-\x1F\x7F]/g, "").substring(0, 5000)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const accessToken = request.headers.get("x-access-token")
  const limit = parseInt(url.searchParams.get("limit") || "100")
  if (!accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 401 })
  }

  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (data: { stage: string; current: number; total: number; message: string; applications?: any[] }) => {
        const safeData = {
          stage: data.stage,
          current: data.current,
          total: data.total,
          message: (data.message || "").replace(/[\x00-\x1F\x7F\n\r]/g, " ").substring(0, 500),
          applications: data.applications?.map((a: any) => ({
            id: a.id?.substring(0, 100) || "",
            company: (a.company || "Unknown").substring(0, 200),
            role: (a.role || "Unknown").substring(0, 200),
            status: a.status || "Applied",
            email_subject: (a.email_subject || "").replace(/[\x00-\x1F\x7F\n\r]/g, " ").substring(0, 500),
            notes: (a.notes || "").replace(/[\x00-\x1F\x7F\n\r]/g, " ").substring(0, 1000)
          }))
        }
        const json = JSON.stringify(safeData)
        controller.enqueue(encoder.encode(`data: ${json}\n\n`))
      }

      try {
        sendProgress({ stage: "search", current: 0, total: 0, message: "Searching for job application emails..." })
        
        const emails: EmailMessage[] = await searchJobEmails(accessToken, limit, (current, total) => {
          sendProgress({ 
            stage: "search", 
            current, 
            total, 
            message: `Fetching emails ${current} of ${total}...` 
          })
        })
        
        sendProgress({ 
          stage: "search", 
          current: emails.length, 
          total: emails.length, 
          message: `Found ${emails.length} potential application emails` 
        })

        if (emails.length === 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ stage: "done", current: 0, total: 0, applications: [], message: "No applications found" })}\n\n`))
          controller.close()
          return
        }

        const applications: any[] = []
        let parsed = 0

        sendProgress({ 
          stage: "parse", 
          current: 0, 
          total: emails.length, 
          message: "Parsing emails..." 
        })

        for (const email of emails) {
          const parsedApp = parseEmail(email)
          if (parsedApp) {
            const hasValidCompany = parsedApp.company && parsedApp.company !== "Unknown Company"
            const hasValidRole = parsedApp.role && parsedApp.role !== "Unknown Role"
            const isJobRelatedSubject = email.subject.toLowerCase().includes('applied') || 
                                         email.subject.toLowerCase().includes('application') ||
                                         email.subject.toLowerCase().includes('job') ||
                                         email.subject.toLowerCase().includes('interview')
            
            if (hasValidCompany || hasValidRole || isJobRelatedSubject) {
              applications.push(parsedApp)
            }
          }
          parsed++
          sendProgress({ 
            stage: "parse", 
            current: parsed, 
            total: emails.length, 
            message: `Parsed ${parsed} of ${emails.length} emails...` 
          })
        }

        const safeApplications = applications.map((a: any) => ({
          ...a,
          company: sanitizeString(a.company) || "Unknown Company",
          role: sanitizeString(a.role) || "Unknown Role",
          email_subject: sanitizeString(a.email_subject),
          notes: sanitizeString(a.notes)
        }))

        console.log(`[Parse Stream] Done. Total emails: ${emails.length}, Parsed applications: ${safeApplications.length}`)
        
        sendProgress({ 
          stage: "done", 
          current: safeApplications.length, 
          total: safeApplications.length, 
          applications: safeApplications,
          message: `Found ${safeApplications.length} job applications` 
        })

        controller.close()
      } catch (error) {
        console.error("Parse stream error:", error)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ stage: "error", message: "Failed to parse emails" })}\n\n`))
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
