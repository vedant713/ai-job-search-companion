import { NextResponse } from "next/server"
import { initializeLocalDb, localDb } from "@/lib/local-db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeLocalDb()
    const { id } = await params
    const application = localDb.applications.getById(id)
    
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    
    return NextResponse.json({ application })
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeLocalDb()
    const { id } = await params
    const data = await request.json()
    const application = localDb.applications.update(id, data)
    
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    
    return NextResponse.json({ application })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeLocalDb()
    const { id } = await params
    localDb.applications.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting application:", error)
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 })
  }
}
