const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const callGroqApi = async (
  messages: { role: 'system' | 'user' | 'assistant', content: string }[],
  model = 'llama-3.1-8b-instant', 
  temperature = 0.7
) => {
  if (!GROQ_API_KEY) {
    console.warn('Groq API Key is not set, returning mock data.');
    return "Mock AI response. Please set VITE_GROQ_API_KEY in .env.local";
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
};
