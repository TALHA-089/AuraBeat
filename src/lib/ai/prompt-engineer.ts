export type BuildMusicGenPromptInput = {
  rawPrompt: string;
  styleTag?: string;
  isInstrumental?: boolean;
};

const STYLE_PROMPT_MAP: Record<string, string> = {
  "Lo-fi":
    "warm vinyl crackle, mellow Rhodes piano, soft tape saturation, lazy boom bap drum loop, relaxed 75 bpm groove",
  "Hip-hop":
    "punchy hip-hop drums, deep 808 bass, rhythmic groove, urban texture, confident beat structure",
  "Pop":
    "catchy pop melody, polished production, bright chords, clean drums, memorable hook, radio-friendly energy",
  "Rock":
    "electric guitars, live drum kit, driving bassline, energetic rhythm section, powerful arrangement",
  "Jazz":
    "smooth jazz harmony, brushed drums, walking bass, warm piano chords, expressive improvisational feel",
  "Classical":
    "orchestral strings, cinematic harmony, elegant piano, dynamic arrangement, expressive classical movement",
  "Electronic":
    "modern synthesizers, electronic drums, sidechain movement, layered arpeggios, clean digital production",
  "Ambient":
    "atmospheric pads, slow evolving textures, spacious reverb, minimal percussion, calm cinematic soundscape",
  "R&B":
    "smooth R&B chords, warm bass, soft drums, soulful melody, intimate late-night groove",
};

function sanitizePrompt(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

function getStyleDescription(styleTag?: string): string {
  if (!styleTag) {
    return "balanced modern music production, clear rhythm, polished mix, emotionally engaging arrangement";
  }

  return (
    STYLE_PROMPT_MAP[styleTag] ??
    `${styleTag} style, polished production, clear rhythm, expressive musical arrangement`
  );
}

/**
 * Converts a simple user idea into a MusicGen-friendly prompt.
 *
 * Academic purpose:
 * This prompt engineering layer is the project's original AI contribution.
 * The base model is Meta's pre-trained MusicGen-small, but this function adds
 * application-level intelligence by translating user choices into structured
 * musical language that the model can understand more effectively.
 */
export function buildMusicGenPrompt({
  rawPrompt,
  styleTag,
  isInstrumental = false,
}: BuildMusicGenPromptInput): string {
  const cleanUserPrompt = sanitizePrompt(rawPrompt);

  const userIdea =
    cleanUserPrompt.length > 0
      ? cleanUserPrompt
      : "an original short music track with a clear mood and memorable musical theme";

  const styleDescription = getStyleDescription(styleTag);

  const vocalDirective = isInstrumental
    ? "instrumental only, no vocals, no singing, no spoken words"
    : "suitable for vocals or melodic lead lines, clear song-like structure";

  const structureDirective =
    "short complete track, intro, main section, subtle variation, clean ending";

  const qualityDirective =
    "high quality audio, coherent composition, balanced mix, pleasant listening experience";

  return [
    userIdea,
    styleDescription,
    vocalDirective,
    structureDirective,
    qualityDirective,
  ].join(", ");
}
