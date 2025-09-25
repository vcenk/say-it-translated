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
    const { recordingId } = await req.json();
    
    if (!recordingId) {
      throw new Error("Recording ID is required");
    }

    // Get recording details
    const { data: recording, error: recordingError } = await supabaseClient
      .from('recordings')
      .select('*')
      .eq('id', recordingId)
      .single();

    if (recordingError || !recording) {
      throw new Error("Recording not found");
    }

    // Update status to processing
    await supabaseClient
      .from('recordings')
      .update({ status: 'processing' })
      .eq('id', recordingId);

    // Get file URL from Supabase Storage
    const { data: urlData } = await supabaseClient.storage
      .from('audio-uploads')
      .createSignedUrl(recording.storage_path, 3600); // 1 hour expiry

    if (!urlData?.signedUrl) {
      throw new Error("Could not get file URL");
    }

    // Fetch the audio file
    const audioResponse = await fetch(urlData.signedUrl);
    if (!audioResponse.ok) {
      throw new Error("Could not fetch audio file");
    }

    const audioBuffer = await audioResponse.arrayBuffer();

    // Prepare form data for Deepgram
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: recording.mime_type });
    formData.append('audio', blob, recording.original_filename);

    // Call Deepgram API
    const deepgramResponse = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&diarize=true&utterances=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('DEEPGRAM_API_KEY')}`,
      },
      body: formData,
    });

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text();
      throw new Error(`Deepgram API error: ${errorText}`);
    }

    const deepgramResult = await deepgramResponse.json();
    const requestId = deepgramResponse.headers.get('dg-request-id');

    // Extract transcript data
    const transcript = deepgramResult.results?.channels?.[0];
    const alternatives = transcript?.alternatives?.[0];
    
    if (!alternatives) {
      throw new Error("No transcript alternatives found");
    }

    // Save transcript to database
    const { data: transcriptData, error: transcriptError } = await supabaseClient
      .from('transcripts')
      .insert({
        recording_id: recordingId,
        text: alternatives.transcript,
        confidence: alternatives.confidence,
        words: alternatives.words || [],
        segments: transcript.alternatives || [],
        language_detected: deepgramResult.results?.channels?.[0]?.detected_language || 'en'
      })
      .select()
      .single();

    if (transcriptError) {
      throw new Error(`Failed to save transcript: ${transcriptError.message}`);
    }

    // Update recording status
    await supabaseClient
      .from('recordings')
      .update({ 
        status: 'completed',
        deepgram_request_id: requestId
      })
      .eq('id', recordingId);

    return new Response(JSON.stringify({ 
      success: true, 
      transcriptId: transcriptData.id,
      text: alternatives.transcript
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Update recording status to failed if we have recordingId
    const errorMessage = error instanceof Error ? error.message : String(error);
    const { recordingId } = await req.json().catch(() => ({}));
    if (recordingId) {
      await supabaseClient
        .from('recordings')
        .update({ 
          status: 'failed',
          error_message: errorMessage
        })
        .eq('id', recordingId);
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});