// Google Gemini AI Integration
import { GoogleGenerativeAI } from "@google/generative-ai"

interface GeminiConfig {
  apiKey: string
  model: string
}

interface GeminiResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export class GeminiAI {
  private config: GeminiConfig
  private genAI: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string, modelStr = "gemini-2.5-flash") {
    this.config = {
      apiKey,
      model: modelStr,
    }
    this.genAI = new GoogleGenerativeAI(this.config.apiKey)
    this.model = this.genAI.getGenerativeModel({ model: this.config.model })
  }

  async generateResponse(prompt: string, context?: string): Promise<GeminiResponse> {
    try {
      if (!this.config.apiKey || this.config.apiKey === "demo-key") {
        console.warn("Gemini API Key is missing or invalid. Using fallback.")
        return {
          text: "Please configure a valid GEMINI_API_KEY in .env.local to receive real AI responses.",
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
        }
      }

      const fullPrompt = context
        ? `Context: ${context}\n\nUser Query: ${prompt}\n\nPlease provide helpful career advice based on the context and query.`
        : prompt

      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      const text = response.text()

      return {
        text,
        usage: {
          promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
          completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
        },
      }
    } catch (error) {
      console.error("Gemini AI Error:", error)
      throw new Error("Failed to generate AI response")
    }
  }
}

// Export singleton instance
export const geminiAI = new GeminiAI(process.env.GEMINI_API_KEY || "", "gemini-2.5-flash")

