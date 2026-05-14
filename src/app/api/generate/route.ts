import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { buildMusicGenPrompt } from "@/lib/ai/prompt-engineer";

type GenerateBody = {
  prompt: string;
  styleTag: string;
  isInstrumental: boolean;
  userId: string;
};

export async function POST(request: NextRequest) {

  try {
    const body = (await request.json()) as Partial<GenerateBody>;

    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const styleTag =
      typeof body.styleTag === "string" ? body.styleTag.trim() : "";
    const isInstrumental = Boolean(body.isInstrumental);
    const userId = typeof body.userId === "string" ? body.userId : "";


    if (!prompt || !styleTag || !userId) {
      return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
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
    });

    const gradioUrl = process.env.GRADIO_SERVER_URL;
    if (!gradioUrl) throw new Error("GRADIO_SERVER_URL not set");


    // Step 1: POST to /gradio_api/call/predict to get event_id
    const submitRes = await fetch(`${gradioUrl}/gradio_api/call/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [optimizedPrompt] }),
    });

    const submitJson = (await submitRes.json()) as { event_id?: string };
    const eventId = submitJson.event_id;
    if (!eventId) throw new Error("No event_id from Gradio");

    // Step 2: GET /gradio_api/call/predict/{event_id} to stream results
    const resultRes = await fetch(
      `${gradioUrl}/gradio_api/call/predict/${eventId}`,
    );
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

