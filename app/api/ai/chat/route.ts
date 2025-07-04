import { type NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/supabase-server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Build conversation context
    let conversationContext = `You are an AI job search assistant. You help users with:
- Writing cover letters and resumes
- Interview preparation and practice questions
- Career advice and skill development
- Job search strategies
- Email templates for follow-ups
- Salary negotiation tips
- Professional networking advice

Be helpful, professional, and provide actionable advice. Keep responses concise but comprehensive.

User's message: ${message}`

    // Add conversation history for context
    if (history && history.length > 0) {
      conversationContext += "\n\nPrevious conversation:\n"
      history.forEach((msg: any) => {
        conversationContext += `${msg.role}: ${msg.content}\n`
      })
    }

    const result = await model.generateContent(conversationContext)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ response: text })
  } catch (error: any) {
    console.error("AI chat error:", error)
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 })
  }
}
