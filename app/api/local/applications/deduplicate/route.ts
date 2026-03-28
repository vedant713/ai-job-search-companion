import { NextResponse } from "next/server"
import { initializeLocalDb, localDb } from "@/lib/local-db"

export async function POST() {
  try {
    await initializeLocalDb()
    const applications = localDb.applications.getAll()
    
    // Sort by created_at descending
    const sorted = [...applications].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    // Track seen company+role combinations
    const seen = new Set<string>()
    const toDelete: string[] = []
    
    for (const app of sorted) {
      const key = `${app.company.toLowerCase().trim()}|${app.role.toLowerCase().trim()}`
      if (seen.has(key)) {
        // This is a duplicate, mark for deletion
        toDelete.push(app.id)
      } else {
        seen.add(key)
      }
    }
    
    // Delete duplicates
    for (const id of toDelete) {
      localDb.applications.delete(id)
    }
    
    return NextResponse.json({ 
      success: true, 
      duplicatesRemoved: toDelete.length,
      uniqueKept: seen.size
    })
  } catch (error) {
    console.error("Error deduplicating applications:", error)
    return NextResponse.json({ error: "Failed to deduplicate applications" }, { status: 500 })
  }
}
