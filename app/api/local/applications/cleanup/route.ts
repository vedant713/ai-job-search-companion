import { NextResponse } from "next/server"
import { initializeLocalDb, localDb } from "@/lib/local-db"

export async function POST() {
  try {
    await initializeLocalDb()
    const applications = localDb.applications.getAll()
    
    let cleanedCount = 0
    const companyPattern = /your application was sent to (.+?)(?:\n|$)/i
    
    for (const app of applications) {
      if (app.company === "Unknown Company" || !app.company || app.company.includes("<")) {
        const match = app.notes?.match(companyPattern)
        if (match && match[1]) {
          localDb.applications.update(app.id, { company: match[1].trim() })
          cleanedCount++
        }
      }
    }
    
    return NextResponse.json({ success: true, cleanedCount })
  } catch (error) {
    console.error("Error cleaning up applications:", error)
    return NextResponse.json({ error: "Failed to cleanup applications" }, { status: 500 })
  }
}
