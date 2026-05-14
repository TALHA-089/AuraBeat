"use client";

import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { createClient } from "@/lib/supabase/client";
import { useAudioStore } from "@/lib/store/audioStore";
import { useToastStore } from "@/lib/store/toastStore";
import { Spinner } from "@/components/ui/Spinner";
import { CheckCircle2, Music2, Play } from "lucide-react";

type GenerateResponse =
  | {
      success: true;
      track: { id: string; title: string; audioUrl: string };
    }
  | { error: string; details?: unknown };

const STYLE_TAGS = [
  "Lo-fi",
  "Hip-hop",
  "Pop",
  "Rock",
  "Jazz",
  "Classical",
  "Electronic",
  "Ambient",
  "R&B",
] as const;

export default function CreateMusicPage() {
  const setTrack = useAudioStore((state) => state.setTrack);
  const addToast = useToastStore((state) => state.addToast);
  const [prompt, setPrompt] = useState("");
  const [styleTag, setStyleTag] = useState<(typeof STYLE_TAGS)[number]>("Lo-fi");
  const [isInstrumental, setIsInstrumental] = useState(true);

  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [trackId, setTrackId] = useState<string | null>(null);
  const [trackTitle, setTrackTitle] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const charCount = prompt.length;
  const canSubmit = useMemo(() => {
    const p = prompt.trim();
    return p.length > 0 && p.length <= 500 && status !== "loading";
  }, [prompt, status]);

  useEffect(() => {
    if (prompt.length > 500) setPrompt((p) => p.slice(0, 500));
  }, [prompt.length]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setTrackId(null);
    setTrackTitle(null);
    setAudioUrl(null);
    setStatus("loading");

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Please sign in first.");
        setStatus("idle");
        return;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          styleTag,
          isInstrumental,
          userId: user.id,
        }),
      });

      const json = (await res.json()) as GenerateResponse;

      if (!res.ok) {
        if ("error" in json && json.error === "INSUFFICIENT_CREDITS") {
          setError("Not enough Gold credits!");
          addToast({
            variant: "error",
            title: "Not enough Gold",
            message: "You need at least 10 Gold to generate a track.",
          });
        } else {
          setError("Generation failed, please try again");
          addToast({
            variant: "error",
            title: "Generation failed",
            message: "Please check the AI server and try again.",
          });
        }
        setStatus("idle");
        return;
      }

      if ("success" in json && json.success) {
        setTrackId(json.track.id);
        setTrackTitle(json.track.title);
        setAudioUrl(json.track.audioUrl);
        setTrack({
          id: json.track.id,
          title: json.track.title,
          audioUrl: json.track.audioUrl,
        });
        addToast({
          variant: "success",
          title: "Track generated",
          message: "Your new track is ready and loaded into the player.",
        });
        setStatus("done");
        return;
      }

      setError("Generation failed, please try again");
      setStatus("idle");
    } catch {
      setError("Generation failed, please try again");
      addToast({
        variant: "error",
        title: "Generation failed",
        message: "Please check the AI server and try again.",
      });
      setStatus("idle");
    }
  }

  return (
    <AppLayout>
      <div className="p-6 text-white">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h1 className="text-2xl font-bold tracking-tight">Create Music</h1>
            <p className="mt-1 text-sm text-white/70">
              Describe what you want to hear. We&apos;ll generate a track for you.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Describe your music
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0D0D1A] px-3 py-3 text-white outline-none focus:border-[#7C3AED]"
                  placeholder="A dreamy lo-fi beat with warm vinyl crackle and soft chords..."
                />
                <div className="mt-2 text-xs text-white/60">
                  {charCount}/500
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold">Style</div>
                <div className="flex flex-wrap gap-2">
                  {STYLE_TAGS.map((tag) => {
                    const selected = styleTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setStyleTag(tag)}
                        className={[
                          "rounded-full border px-3 py-1 text-sm font-semibold transition-colors",
                          selected
                            ? "border-[#7C3AED] bg-[#7C3AED]/20 text-white"
                            : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
                        ].join(" ")}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">Vocals</div>
                  <div className="text-xs text-white/60">
                    {isInstrumental ? "Instrumental" : "With Vocals"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsInstrumental((v) => !v)}
                  className={[
                    "relative h-7 w-12 rounded-full border transition-colors",
                    isInstrumental
                      ? "border-white/15 bg-white/10"
                      : "border-[#7C3AED]/40 bg-[#7C3AED]/20",
                  ].join(" ")}
                  aria-pressed={!isInstrumental}
                  aria-label="Toggle vocals"
                >
                  <span
                    className={[
                      "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition-all",
                      isInstrumental ? "left-1" : "left-6",
                    ].join(" ")}
                  />
                </button>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-3 font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? (
                  <>
                    <Spinner size="sm" />
                    Creating...
                  </>
                ) : (
                  "Create Music"
                )}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            {status === "idle" ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0D0D1A] p-8 text-center">
                <Music2 className="h-10 w-10 text-white/70" />
                <div className="mt-3 text-lg font-semibold">
                  Your music will appear here
                </div>
                <div className="mt-1 text-sm text-white/60">
                  Generate a track to preview and play it.
                </div>
              </div>
            ) : null}

            {status === "loading" ? (
              <div className="flex h-full min-h-[320px] items-center justify-center">
                <div className="w-full rounded-xl border border-[#7C3AED]/30 bg-[#111128] p-8 text-center text-white animate-pulse">
                  <div className="text-xl font-bold">Generating your track…</div>
                  <div className="mt-2 text-sm text-white/70">
                    this takes ~30 seconds
                  </div>
                </div>
              </div>
            ) : null}

            {status === "done" ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-[#111128] p-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                <div className="mt-4 text-lg font-semibold text-white">
                  {trackTitle ?? "Your Track"}
                </div>
                <div className="mt-2 text-sm text-white/60">
                  Loaded into the AuraBeat player.
                </div>
                {audioUrl && trackId ? (
                  <button
                    type="button"
                    onClick={() =>
                      setTrack({
                        id: trackId,
                        title: trackTitle ?? "Your Track",
                        audioUrl,
                      })
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <Play className="h-4 w-4" />
                    Play in Player
                  </button>
                ) : (
                  <div className="mt-4 text-sm text-white/40">Audio not available.</div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

