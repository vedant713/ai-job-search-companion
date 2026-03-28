import { type NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/supabase-server"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === "true"

export async function POST(request: NextRequest) {
  try {
    if (USE_SUPABASE) {
      const user = await getUser(request)
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (!OPENROUTER_API_KEY) {
      console.error("OpenRouter API key not configured")
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 })
    }

    const systemPrompt = `You are an expert AI job search assistant helping users with their career journey. Your specialties include:
- Writing compelling cover letters and optimizing resumes
- Interview preparation including common questions, behavioral questions, and technical assessments
- Career development advice and skill improvement strategies
- Job search strategies across different platforms and industries
- Crafting professional follow-up and networking emails
- Salary negotiation techniques and market research
- Building a strong professional network and online presence

Always be helpful, professional, and provide actionable, specific advice. When appropriate, provide examples or templates. Keep responses concise but comprehensive. If you're unsure about specific industry norms, acknowledge the uncertainty and provide general best practices.`

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt }
    ]

    if (history && history.length > 0) {
      history.forEach((msg: any) => {
        messages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content
        })
      })
    }

    messages.push({ role: "user", content: message })

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": request.headers.get("referer") || "http://localhost:3000",
        "X-Title": "AI Job Search Assistant"
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("OpenRouter API error:", response.status, errorData)
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      throw new Error("No response from AI")
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error: any) {
    console.error("AI chat error:", error)
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 })
  }
}
