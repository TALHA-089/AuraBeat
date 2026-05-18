import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { buildMusicGenPrompt } from "@/lib/ai/prompt-engineer";
import { authenticateApiKey } from "@/lib/auth/apiKey";
import { createAdminClient } from "@/lib/supabase/admin";

type GenerateBody = {
  prompt: string;
  style?: string;
  styleTag?: string;
  instrumental?: boolean;
  isInstrumental?: boolean;
  lyrics?: string;
  vocalGender?: "any" | "male" | "female" | string;
  vocalTone?: string;
  referenceAudioUrl?: string | null;
  melodyAudioUrl?: string | null;
};

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS_PER_WINDOW = 10;

export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as Partial<GenerateBody>;
    const rawPromptText = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const styleTag =
      typeof body.styleTag === "string"
        ? body.styleTag.trim()
        : typeof body.style === "string"
          ? body.style.trim()
          : "";
    const isInstrumental = Boolean(body.isInstrumental ?? body.instrumental);
    const lyrics = typeof body.lyrics === "string" ? body.lyrics.trim() : "";
    const vocalGender = typeof body.vocalGender === "string" ? body.vocalGender : "";
    const vocalTone = typeof body.vocalTone === "string" ? body.vocalTone : "";
    const referenceAudioUrl =
      typeof body.referenceAudioUrl === "string" ? body.referenceAudioUrl : null;
    const melodyAudioUrl =
      typeof body.melodyAudioUrl === "string" ? body.melodyAudioUrl : null;

    const prompt = rawPromptText.replace(/<[^>]*>?/gm, "").substring(0, 500);

    if (!prompt || !styleTag) {
      return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
    }

    const now = Date.now();
    const limit = rateLimitMap.get(auth.keyId) || { count: 0, lastReset: now };
    if (now - limit.lastReset > RATE_LIMIT_WINDOW) {
      limit.count = 1;
      limit.lastReset = now;
    } else {
      limit.count += 1;
    }
    rateLimitMap.set(auth.keyId, limit);

    if (limit.count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: "RATE_LIMIT_EXCEEDED" },
        { status: 429 },
      );
    }

    const supabase = createAdminClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("gold_balance")
      .eq("id", auth.userId)
      .maybeSingle<{ gold_balance: number | null }>();

    if (profileError || !profile) {
      return NextResponse.json({ error: "PROFILE_NOT_FOUND" }, { status: 404 });
    }

    const currentGold = profile.gold_balance ?? 0;
    if (currentGold < 10) {
      return NextResponse.json({ error: "INSUFFICIENT_CREDITS" }, { status: 422 });
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

    const submitRes = await fetch(`${gradioUrl}/gradio_api/call/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [optimizedPrompt] }),
      signal: AbortSignal.timeout(10000),
    });

    if (!submitRes.ok) {
      return NextResponse.json({ error: "AI_SERVER_ERROR" }, { status: 502 });
    }

    const submitJson = (await submitRes.json()) as { event_id?: string };
    const eventId = submitJson.event_id;
    if (!eventId) throw new Error("No event_id from Gradio");

    const resultRes = await fetch(
      `${gradioUrl}/gradio_api/call/predict/${eventId}`,
      { signal: AbortSignal.timeout(60000) },
    );
    const resultText = await resultRes.text();
    const dataLines = resultText.split("\n").filter((l) => l.startsWith("data:"));
    const lastDataLine = dataLines[dataLines.length - 1];
    const dataJson = JSON.parse(lastDataLine.replace("data:", "").trim()) as unknown[];
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
      return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("tracks").getPublicUrl(fileName);

    const { error: deductError } = await supabase
      .from("profiles")
      .update({ gold_balance: currentGold - 10 })
      .eq("id", auth.userId);

    if (deductError) {
      return NextResponse.json({ error: "CREDIT_DEDUCTION_FAILED" }, { status: 500 });
    }

    const title = prompt.slice(0, 50);

    const { data: track, error: insertError } = await supabase
      .from("tracks")
      .insert({
        user_id: auth.userId,
        title,
        prompt,
        style_tags: [styleTag],
        audio_url: publicUrl,
        status: "completed",
      })
      .select("id, title, audio_url")
      .single<{ id: string; title: string | null; audio_url: string | null }>();

    if (insertError || !track) {
      return NextResponse.json({ error: "TRACK_INSERT_FAILED" }, { status: 500 });
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
    return NextResponse.json(
      { error: "UNKNOWN_ERROR", details: err instanceof Error ? err.message : err },
      { status: 500 },
    );
  }
}
