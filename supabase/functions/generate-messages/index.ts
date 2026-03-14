import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lead_id, campaign_id } = await req.json()
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    // Fetch Context
    const { data: lead } = await supabaseAdmin.from('leads').select('*').eq('id', lead_id).single()
    const { data: campaign } = await supabaseAdmin.from('campaigns').select('*').eq('id', campaign_id).single()
    
    const prompt = `
      You are an expert SDR. Based on the following context, generate 3 personalized outreach messages.
      Format: Return ONLY a JSON array of 3 strings.
      
      Campaign: ${campaign.name}
      Context: ${campaign.context}
      Instructions: ${campaign.generation_prompt}
      
      Lead: ${lead.name}
      Company: ${lead.company}
      Role: ${lead.role}
      Notes: ${lead.notes}
    `

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    })

    const result = await response.json()
    const messagesText = result.candidates[0].content.parts[0].text
    // Expected format from Gemini + mime type: ["msg1", "msg2", "msg3"]
    const messages = JSON.parse(messagesText)
    
    // Save to generated_messages table
    const { data: saved } = await supabaseAdmin
      .from('generated_messages')
      .insert({ lead_id, campaign_id, messages })
      .select().single()

    return new Response(JSON.stringify({ messages, id: saved.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
