type AudioFormat = "mp3" | "wav";

function sanitizeFilename(name: string) {
  const safe = name.replace(/[^a-z0-9_-]+/gi, "_").replace(/^_+|_+$/g, "");
  return safe.length > 0 ? safe.slice(0, 60) : "track";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function audioBufferToWav(buffer: AudioBuffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;

  const wavBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(wavBuffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c += 1) {
    channels.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < numFrames; i += 1) {
    for (let c = 0; c < numChannels; c += 1) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([wavBuffer], { type: "audio/wav" });
}

async function decodeAudioBuffer(arrayBuffer: ArrayBuffer) {
  const audioContext = new AudioContext();
  const buffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  await audioContext.close();
  return buffer;
}

export async function downloadAudioFromUrl(
  url: string,
  baseName: string,
  format: AudioFormat,
) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to download audio");
  }

  const arrayBuffer = await response.arrayBuffer();
  const safeName = sanitizeFilename(baseName);

  if (format === "wav") {
    const buffer = await decodeAudioBuffer(arrayBuffer);
    const wavBlob = audioBufferToWav(buffer);
    downloadBlob(wavBlob, `${safeName}.wav`);
    return;
  }

  const mp3Blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
  downloadBlob(mp3Blob, `${safeName}.mp3`);
}
