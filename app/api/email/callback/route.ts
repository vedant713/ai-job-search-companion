import { NextResponse } from "next/server"
import { getTokenFromCode } from "@/lib/email-parser"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const clientId = searchParams.get("clientId") || undefined
  const clientSecret = searchParams.get("clientSecret") || undefined
  
  if (!code) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Error: No code provided</h1>
          <p>Redirecting...</p>
          <script>setTimeout(() => window.location.href = '/dashboard/email-import', 2000)</script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  }
  
  try {
    const token = await getTokenFromCode(code, clientId, clientSecret)
    
    // Return HTML that stores token in localStorage and redirects
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Gmail Connected</title>
          <style>
            body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #1a1a1a; color: white; }
            .container { text-align: center; padding: 2rem; background: #2a2a2a; border-radius: 8px; }
            h1 { color: #22c55e; }
            p { color: #aaa; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ Gmail Connected!</h1>
            <p>Storing your access token and redirecting...</p>
          </div>
          <script>
            try {
              localStorage.setItem("gmail_access_token", "${token}");
              window.location.href = "/dashboard/email-import";
            } catch (e) {
              document.body.innerHTML += "<p>Error: " + e.message + "</p>";
            }
          </script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  } catch (error) {
    console.error("OAuth callback error:", error)
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Error: Failed to get token</h1>
          <p>${error instanceof Error ? error.message : String(error)}</p>
          <p>Redirecting...</p>
          <script>setTimeout(() => window.location.href = '/dashboard/email-import', 5000)</script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  }
}
