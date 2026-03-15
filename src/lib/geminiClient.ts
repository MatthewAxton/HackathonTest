import { supabase } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

interface GeminiMessage {
  role: 'user' | 'model'
  text: string
}

export async function sendToGemini(messages: GeminiMessage[]): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return "Not authenticated. Please refresh the page."
    }

    const res = await fetch(`${SUPABASE_URL}/functions/v1/gemini-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        contents: messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        })),
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Gemini proxy error:', errText)
      return "Sorry, I'm having trouble connecting right now. Try again in a moment!"
    }

    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text
      ?? "Hmm, I didn't get a response. Try asking again!"
  } catch (err) {
    console.error('Gemini fetch error:', err)
    return "Sorry, I'm having trouble connecting right now. Try again in a moment!"
  }
}
