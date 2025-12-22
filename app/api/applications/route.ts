import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, getUser } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabaseServer
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { company, role, status = "Applied", notes, job_url, salary_range, location } = body

    if (!company || !role) {
      return NextResponse.json({ error: "Company and role are required" }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("applications")
      .insert({
        user_id: user.id,
        company,
        role,
        status,
        notes,
        job_url,
        salary_range,
        location,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("applications")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 })
    }

    const { error } = await supabaseServer.from("applications").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
