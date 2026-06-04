import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../shared/cors.ts"

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { question } = await req.json()

    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set")
    }

    const prompt = `Solve the following academic question step-by-step. Provide a clear explanation for each step, and highlight the final answer:\n\nQuestion: ${question}`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    })

    const data = await response.json()

    return new Response(
      JSON.stringify({ solution: data.choices[0]?.message?.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
