import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { transcriptId, targetLanguage, text } = await req.json();
    
    if (!transcriptId || !targetLanguage || !text) {
      throw new Error("Transcript ID, target language, and text are required");
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Call OpenAI for translation
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text to ${targetLanguage}. Maintain the original meaning, tone, and formatting. Only return the translated text, no additional comments.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 4000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const translatedText = result.choices[0]?.message?.content;

    if (!translatedText) {
      throw new Error('No translation received from OpenAI');
    }

    // Save translation to database
    const { data: translationData, error: translationError } = await supabaseClient
      .from('translations')
      .insert({
        transcript_id: transcriptId,
        target_lang: targetLanguage,
        text: translatedText,
        model: 'gpt-4o-mini'
      })
      .select()
      .single();

    if (translationError) {
      throw new Error(`Failed to save translation: ${translationError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      translationId: translationData.id,
      translatedText
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Translation error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});