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

export async function PUT(request: Request) {
  try {
    await initializeLocalDb()
    const data = await request.json()
    const { id, description, due_date, is_complete, priority, tags, context, status } = data

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    const updatedTask = localDb.tasks.update(id, {
      description,
      due_date,
      is_complete,
      priority,
      tags,
      context,
      status,
    })

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await initializeLocalDb()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    localDb.tasks.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
