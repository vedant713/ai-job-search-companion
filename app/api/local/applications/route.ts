import { NextResponse } from "next/server"
import { initializeLocalDb, localDb } from "@/lib/local-db"

export async function GET() {
  try {
    await initializeLocalDb()
    const applications = localDb.applications.getAll()
    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await initializeLocalDb()
    const data = await request.json()
    const { company, role, status, date_applied, notes, job_url, salary_range, location } = data

    const application = localDb.applications.create({
      company,
      role,
      status: status || "Applied",
      date_applied,
      notes,
      job_url,
      salary_range,
      location,
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
  }
}
