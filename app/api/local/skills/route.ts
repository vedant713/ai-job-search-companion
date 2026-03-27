import { NextResponse } from "next/server"
import { initializeLocalDb, localDb } from "@/lib/local-db"

export async function GET() {
  try {
    await initializeLocalDb()
    const skills = localDb.skills.getAll()
    return NextResponse.json({ skills })
  } catch (error) {
    console.error("Error fetching skills:", error)
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await initializeLocalDb()
    const data = await request.json()
    const { skill_name, proficiency, target_proficiency } = data

    const skill = localDb.skills.create({
      skill_name,
      proficiency: proficiency || 0,
      target_proficiency,
    })

    return NextResponse.json({ skill })
  } catch (error) {
    console.error("Error creating skill:", error)
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 })
  }
}
