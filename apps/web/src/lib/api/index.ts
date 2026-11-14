import { memoryStorage, type KeyValueStorage } from "./mock/db";
import { MockFlipbookApi } from "./mock/mock-api";
import type { FlipbookApi } from "./types";

export type { FlipbookApi } from "./types";
export { ApiError } from "./types";

let instance: FlipbookApi | null = null;

function browserStorage(): KeyValueStorage {
  try {
    const probe = "flipbook:probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return memoryStorage();
  }
}

/** Client-only. Swap the implementation here (e.g. an HttpFlipbookApi) without touching features. */
export function getApi(): FlipbookApi {
  if (!instance) {
    instance = new MockFlipbookApi({ storage: typeof window === "undefined" ? memoryStorage() : browserStorage() });
  }
  return instance;
}

export function setApi(api: FlipbookApi | null): void {
  instance = api;
}
