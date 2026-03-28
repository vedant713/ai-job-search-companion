import { NextResponse } from "next/server"
import { getAuthUrl, parseAllEmails, setAccessToken } from "@/lib/email-parser"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    if (action === "auth-url") {
      const clientId = searchParams.get("clientId") || undefined
      const clientSecret = searchParams.get("clientSecret") || undefined
      const url = getAuthUrl(clientId, clientSecret)
      return NextResponse.json({ url })
    }

    if (action === "callback") {
      const code = searchParams.get("code")
      if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 })
      }
      const clientId = searchParams.get("clientId") || undefined
      const clientSecret = searchParams.get("clientSecret") || undefined
      const { getTokenFromCode } = await import("@/lib/email-parser")
      const token = await getTokenFromCode(code, clientId, clientSecret)
      return NextResponse.json({ success: true, message: "Token obtained. Store this securely." })
    }

    if (action === "parse") {
      const accessToken = request.headers.get("x-access-token")
      if (!accessToken) {
        return NextResponse.json({ error: "No access token" }, { status: 401 })
      }
      setAccessToken(accessToken)
      const applications = await parseAllEmails(accessToken)
      return NextResponse.json({ applications })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
