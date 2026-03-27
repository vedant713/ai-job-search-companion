import { NextResponse } from "next/server"
import { initializeLocalDb, localDb } from "@/lib/local-db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeLocalDb()
    const { id } = await params
    const skill = localDb.skills.getById(id)
    
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }
    
    return NextResponse.json({ skill })
  } catch (error) {
    console.error("Error fetching skill:", error)
    return NextResponse.json({ error: "Failed to fetch skill" }, { status: 500 })
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
    const skill = localDb.skills.update(id, data)
    
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }
    
    return NextResponse.json({ skill })
  } catch (error) {
    console.error("Error updating skill:", error)
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeLocalDb()
    const { id } = await params
    localDb.skills.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting skill:", error)
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 })
  }
}
