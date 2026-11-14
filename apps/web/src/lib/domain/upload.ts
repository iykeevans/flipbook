import { ACCEPTED_RECORDING_EXTENSIONS, ACCEPTED_RECORDING_TYPES, MAX_RECORDING_BYTES } from "./constants";

export interface RecordingFileLike {
  name: string;
  type: string;
  size: number;
}

/** Returns a user-facing error, or null when the file can start processing (PRD VID-002). */
export function validateRecordingFile(file: RecordingFileLike): string | null {
  const name = file.name.toLowerCase();
  const typeOk = (ACCEPTED_RECORDING_TYPES as readonly string[]).includes(file.type);
  const extOk = ACCEPTED_RECORDING_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!typeOk && !extOk) {
    return `${file.name} isn't a supported video. Use an .mp4, .mov or .webm recording.`;
  }
  if (file.size > MAX_RECORDING_BYTES) {
    const mb = Math.round(file.size / (1024 * 1024));
    return `${file.name} is ${mb} MB. Recordings can be up to 250 MB.`;
  }
  return null;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function projectNameFromFile(fileName: string): string {
  return slugify(fileName.replace(/\.[^.]+$/, "")) || "recording";
}

export function projectNameFromUrl(url: string): string {
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return slugify(u.hostname.replace(/^www\./, "")) || "recorded-site";
  } catch {
    return slugify(url) || "recorded-site";
  }
}
