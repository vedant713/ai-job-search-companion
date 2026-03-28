import { NextResponse } from "next/server"
import { initializeLocalDb, localDb } from "@/lib/local-db"
import type { ParsedApplication } from "@/lib/email-parser"

export async function POST(request: Request) {
  try {
    await initializeLocalDb()
    const data = await request.json()
    const { applications } = data as { applications: ParsedApplication[] }

    if (!applications || !Array.isArray(applications)) {
      return NextResponse.json({ error: "Invalid applications data" }, { status: 400 })
    }

    const created: any[] = []

    for (const app of applications) {
      const createdApp = localDb.applications.create({
        company: app.company,
        role: app.role,
        status: app.status || "Applied",
        date_applied: app.date_applied,
        notes: app.notes || `Imported from email: ${app.email_subject || "Unknown"}`,
        job_url: app.job_url,
        salary_range: app.salary_range,
        location: app.location
      })
      created.push(createdApp)
    }

    return NextResponse.json({ 
      success: true, 
      imported: created.length,
      applications: created 
    })
  } catch (error) {
    console.error("Error importing applications:", error)
    return NextResponse.json({ error: "Failed to import applications" }, { status: 500 })
  }
}
