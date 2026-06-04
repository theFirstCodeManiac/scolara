import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../shared/cors.ts"

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, mode } = await req.json()

    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set")
    }

    let systemPrompt = "You are an expert AI tutor for university students."
    if (mode === 'beginner') systemPrompt += " Explain everything in extremely simple terms, as if to a beginner."
    if (mode === 'analogy') systemPrompt += " Use clear, real-world analogies to explain complex concepts."
    if (mode === 'exam') systemPrompt += " Focus strictly on high-yield, exam-relevant facts and common pitfalls."

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ]

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: apiMessages,
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    return new Response(
      JSON.stringify({ content: data.choices[0]?.message?.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
