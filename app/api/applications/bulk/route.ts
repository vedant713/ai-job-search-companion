import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, getUser } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, ids, data } = body

    if (!action || !ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    let result

    switch (action) {
      case "delete":
        const { error: deleteError } = await supabaseServer
          .from("applications")
          .delete()
          .in("id", ids)
          .eq("user_id", user.id)

        if (deleteError) {
          console.error("Bulk delete error:", deleteError)
          return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }

        result = { success: true, message: `${ids.length} applications deleted` }
        break

      case "update_status":
        if (!data?.status) {
          return NextResponse.json({ error: "Status is required for update" }, { status: 400 })
        }

        const { error: updateError } = await (supabaseServer
          .from("applications")
          .update({ status: data.status } as any)
          .in("id", ids)
          .eq("user_id", user.id) as any)

        if (updateError) {
          console.error("Bulk update error:", updateError)
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        result = { success: true, message: `${ids.length} applications updated` }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Bulk operation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
