import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../shared/cors.ts"

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()

    const prompt = `Extract the top 5 high-yield academic topics from the following text. Return the result as a JSON array of objects with 'name' and 'frequency' keys:\n\n${text.substring(0, 5000)}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()

    return new Response(
      JSON.stringify({ topics: JSON.parse(data.choices[0]?.message?.content).topics || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
