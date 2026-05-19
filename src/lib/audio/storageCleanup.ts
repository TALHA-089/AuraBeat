type StorageRemovalClient = {
  storage: {
    from: (bucket: string) => {
      remove: (paths: string[]) => PromiseLike<{
        error: { message?: string } | null;
      }>;
    };
  };
};

export type TrackAudioRemovalResult = {
  attempted: boolean;
  removed: boolean;
  objectPath: string | null;
  error: string | null;
};

const STORAGE_PATH_MARKERS = [
  "/storage/v1/object/public/tracks/",
  "/storage/v1/object/sign/tracks/",
  "/storage/v1/object/authenticated/tracks/",
];

export function getTrackAudioObjectPath(audioUrl: string | null | undefined) {
  if (!audioUrl) return null;

  let url: URL;
  try {
    url = new URL(audioUrl);
  } catch {
    return null;
  }

  const marker = STORAGE_PATH_MARKERS.find((item) => url.pathname.includes(item));
  if (!marker) return null;

  const markerIndex = url.pathname.indexOf(marker);
  const objectPath = decodeURIComponent(
    url.pathname.slice(markerIndex + marker.length),
  );

  return objectPath || null;
}

export async function removeStoredTrackAudio(
  supabase: StorageRemovalClient,
  audioUrl: string | null | undefined,
): Promise<TrackAudioRemovalResult> {
  const objectPath = getTrackAudioObjectPath(audioUrl);

  if (!objectPath) {
    return {
      attempted: false,
      removed: false,
      objectPath: null,
      error: null,
    };
  }

  const { error } = await supabase.storage.from("tracks").remove([objectPath]);

  return {
    attempted: true,
    removed: !error,
    objectPath,
    error: error?.message ?? null,
  };
}
