import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { buildMusicGenPrompt } from "@/lib/ai/prompt-engineer";

type GenerateBody = {
  prompt: string;
  styleTag: string;
  isInstrumental: boolean;
  userId: string;
  lyrics?: string;
  vocalGender?: "any" | "male" | "female" | string;
  vocalTone?: string;
  referenceAudioUrl?: string | null;
  melodyAudioUrl?: string | null;
};

// Simple in-memory rate limiter mock
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

export async function POST(request: NextRequest) {

  try {
    const body = (await request.json()) as Partial<GenerateBody>;

    const rawPromptText = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const styleTag = typeof body.styleTag === "string" ? body.styleTag.trim() : "";
    const isInstrumental = Boolean(body.isInstrumental);
    const userId = typeof body.userId === "string" ? body.userId : "";
    const lyrics = typeof body.lyrics === "string" ? body.lyrics.trim() : "";
    const vocalGender = typeof body.vocalGender === "string" ? body.vocalGender : "";
    const vocalTone = typeof body.vocalTone === "string" ? body.vocalTone : "";
    const referenceAudioUrl =
      typeof body.referenceAudioUrl === "string" ? body.referenceAudioUrl : null;
    const melodyAudioUrl =
      typeof body.melodyAudioUrl === "string" ? body.melodyAudioUrl : null;

    // AI Standard: Prompt Sanitization
    const prompt = rawPromptText.replace(/<[^>]*>?/gm, "").substring(0, 500);

    if (!prompt || !styleTag || !userId) {
      return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
    }

    // Cloud Standard: Rate Limiting Check
    const now = Date.now();
    const userLimit = rateLimitMap.get(userId) || { count: 0, lastReset: now };
    
    if (now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
      userLimit.count = 1;
      userLimit.lastReset = now;
    } else {
      userLimit.count += 1;
    }
    rateLimitMap.set(userId, userLimit);

    if (userLimit.count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: "RATE_LIMIT_EXCEEDED", details: "Please wait a minute before generating again." },
        { status: 429 }
      );
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("gold_balance")
      .eq("id", userId)
      .maybeSingle<{ gold_balance: number | null }>();

    if (profileError || !profile) {
      return NextResponse.json({ error: "PROFILE_NOT_FOUND" }, { status: 404 });
    }

    const currentGold = profile.gold_balance ?? 0;
    if (currentGold < 10) {
      return NextResponse.json(
        { error: "INSUFFICIENT_CREDITS" },
        { status: 422 },
      );
    }

    const optimizedPrompt = buildMusicGenPrompt({
      rawPrompt: prompt,
      styleTag,
      isInstrumental,
      lyrics,
      vocalGender,
      vocalTone,
      referenceAudioUrl,
      melodyAudioUrl,
    });

    const gradioUrl = process.env.GRADIO_SERVER_URL;
    if (!gradioUrl) throw new Error("GRADIO_SERVER_URL not set");


    // AI Standard: Graceful AI Degradation
    let submitRes;
    try {
      submitRes = await fetch(`${gradioUrl}/gradio_api/call/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [optimizedPrompt] }),
        signal: AbortSignal.timeout(10000), // 10s timeout
      });
    } catch (fetchErr) {
      console.error("Gradio fetch error:", fetchErr);
      return NextResponse.json(
        { error: "AI_SERVER_OFFLINE", details: "The AI engine is currently unreachable. Please start the Colab server." },
        { status: 503 }
      );
    }

    if (!submitRes.ok) {
       return NextResponse.json(
        { error: "AI_SERVER_ERROR", details: "The AI engine responded with an error." },
        { status: 502 }
      );
    }

    const submitJson = (await submitRes.json()) as { event_id?: string };
    const eventId = submitJson.event_id;
    if (!eventId) throw new Error("No event_id from Gradio");

    // Step 2: GET /gradio_api/call/predict/{event_id} to stream results
    let resultRes;
    try {
      resultRes = await fetch(
        `${gradioUrl}/gradio_api/call/predict/${eventId}`,
        { signal: AbortSignal.timeout(60000) } // 60s timeout for generation
      );
    } catch {
       return NextResponse.json(
        { error: "AI_GENERATION_TIMEOUT", details: "The AI engine took too long to respond." },
        { status: 504 }
      );
    }
    const resultText = await resultRes.text();

    // Parse SSE format - look for "data:" lines
    const dataLines = resultText
      .split("\n")
      .filter((l) => l.startsWith("data:"));
    const lastDataLine = dataLines[dataLines.length - 1];
    const dataJson = JSON.parse(
      lastDataLine.replace("data:", "").trim(),
    ) as unknown[];
    const audioOutput = dataJson[0];


    const audioFileUrl =
      typeof audioOutput === "string"
        ? audioOutput
        : (audioOutput as { url?: string; path?: string }).url ||
          (audioOutput as { url?: string; path?: string }).path;

    if (!audioFileUrl) throw new Error("No audio URL in Gradio output");

    const audioRes = await fetch(audioFileUrl);
    const audioBuffer = await audioRes.arrayBuffer();

    const fileName = `${crypto.randomUUID()}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from("tracks")
      .upload(fileName, audioBuffer, { contentType: "audio/mpeg" });

    if (uploadError) {
      return NextResponse.json(
        { error: "UPLOAD_FAILED", details: uploadError.message },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("tracks").getPublicUrl(fileName);

    const { error: deductError } = await supabase
      .from("profiles")
      .update({ gold_balance: currentGold - 10 })
      .eq("id", userId);

    if (deductError) {
      return NextResponse.json(
        { error: "CREDIT_DEDUCTION_FAILED", details: deductError.message },
        { status: 500 },
      );
    }

    const title = prompt.slice(0, 50);

    const { data: track, error: insertError } = await supabase
      .from("tracks")
      .insert({
        user_id: userId,
        title,
        prompt,
        style_tags: [styleTag],
        audio_url: publicUrl,
        status: "completed",
      })
      .select("id, title, audio_url")
      .single<{ id: string; title: string | null; audio_url: string | null }>();

    if (insertError || !track) {
      return NextResponse.json(
        { error: "TRACK_INSERT_FAILED", details: insertError?.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      track: {
        id: track.id,
        title: track.title ?? title,
        audioUrl: publicUrl,
      },
    });
  } catch (err) {
    console.error("CAUGHT ERROR:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "UNKNOWN_ERROR", details: err instanceof Error ? err.message : err },
      { status: 500 },
    );
  }
}

