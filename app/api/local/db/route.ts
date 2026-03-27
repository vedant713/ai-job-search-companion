import { NextResponse } from "next/server"
import { initializeLocalDb, localDb, getLocalUserId } from "@/lib/local-db"

export async function POST(request: Request) {
  try {
    const { action } = await request.json()
    
    await initializeLocalDb()

    if (action === "init") {
      return NextResponse.json({ 
        success: true, 
        userId: getLocalUserId(),
        profile: localDb.profiles.get()
      })
    }

    if (action === "getProfile") {
      return NextResponse.json({ profile: localDb.profiles.get() })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Local DB API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await initializeLocalDb()
    return NextResponse.json({ 
      userId: getLocalUserId(),
      profile: localDb.profiles.get(),
      initialized: true 
    })
  } catch (error) {
    console.error("Local DB API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
