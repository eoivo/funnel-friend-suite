import { supabase } from "@/lib/supabase";

export async function generateSDRMessages(lead: any, campaign: any) {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API Key not configured in .env.local");
  }

  const prompt = `
    Você é um SDR (Sales Development Representative) especialista em prospecção.
    Gere 3 mensagens de abordagem distintas, personalizadas e profissionais para o lead abaixo.
    
    Contexto da Campanha: ${campaign.context}
    Instruções da Campanha: ${campaign.generation_prompt}
    
    Nome do Lead: ${lead.name}
    Empresa do Lead: ${lead.company}
    Cargo: ${lead.role}
    Notas/Contexto: ${lead.notes}
    
    Retorne APENAS um array JSON válido contendo 3 strings.
    Exemplo: ["Mensagem 1...", "Mensagem 2...", "Mensagem 3..."]
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      })
    });

    const result = await response.json();

    if (result.error) throw new Error(result.error.message);

    const text = result.candidates[0].content.parts[0].text;
    const messages = JSON.parse(text);

    // Save to database
    const { data, error } = await supabase
      .from('generated_messages')
      .insert({
        lead_id: lead.id,
        campaign_id: campaign.id,
        messages: messages
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase.from("activity_logs").insert({
        workspace_id: lead.workspace_id,
        lead_id: lead.id,
        user_id: userData.user.id,
        action: "ai_generation",
        metadata: {
          lead_name: lead.name,
          campaign_name: campaign.name
        }
      });
    }

    return { messages, id: data.id };

  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}
