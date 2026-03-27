import { NextResponse } from "next/server"
import { initializeLocalDb, localDb } from "@/lib/local-db"

export async function GET() {
  try {
    await initializeLocalDb()
    const tasks = localDb.tasks.getAll()
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await initializeLocalDb()
    const data = await request.json()
    const { description, due_date, is_complete, priority, tags, context, status } = data

    const task = localDb.tasks.create({
      description,
      due_date,
      is_complete: is_complete || false,
      priority: priority || "Medium",
      tags,
      context,
      status,
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
