"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent } from "react";
import { Button, PageTitle, cn } from "@/components/ui";
import type { CreateProjectInput } from "@/lib/api/types";
import { DEFAULT_OUTPUTS, OUTPUT_CHOICES } from "@/lib/domain/constants";
import { validateRecordingFile } from "@/lib/domain/upload";
import { routes } from "@/lib/routes";
import { useAppStore } from "@/lib/store/app-store";
import Link from "next/link";

const ACCEPT = "video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm";

export function NewProjectScreen() {
  const router = useRouter();
  const createProject = useAppStore((s) => s.createProject);
  const fileInput = useRef<HTMLInputElement>(null);
  const [outputs, setOutputs] = useState<string[]>(DEFAULT_OUTPUTS);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const start = async (input: CreateProjectInput) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { project } = await createProject(input);
      router.push(routes.project(project.id, "processing"));
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const startWithFile = (file: File | undefined) => {
    if (!file) return;
    const problem = validateRecordingFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    void start({ source: "file", fileName: file.name, sizeBytes: file.size, mimeType: file.type, outputs });
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    startWithFile(e.dataTransfer.files[0]);
  };

  const autoRecord = () => {
    if (!url.trim()) {
      setError("Paste a URL first and we'll record the scroll for you.");
      return;
    }
    void start({ source: "url", url: url.trim(), outputs });
  };

  const toggleOutput = (o: string) => setOutputs((cur) => (cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]));

  return (
    <div className="mx-auto mt-6 flex max-w-[760px] flex-col gap-[22px]">
      <div className="flex flex-col gap-2">
        <PageTitle size="xl">What are we rebuilding today?</PageTitle>
        <p className="m-0 text-base text-fg-subtle">Record a site, get working code, then learn every animation in it.</p>
      </div>

      <div
        data-testid="drop-zone"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex h-[220px] flex-col items-center justify-center gap-3.5 rounded-[14px] border-[1.5px] border-dashed bg-stripe-drop px-4 transition-colors hover:border-orange",
          dragging ? "border-orange" : "border-edge-3",
        )}
      >
        <span className="text-center font-mono text-xs text-fg-dim">drop .mp4 / .mov / .webm, up to 3 min · 250 MB</span>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Button variant="primary" size="lg" onClick={() => void start({ source: "tab", outputs })} disabled={busy}>
            <span aria-hidden className="size-[9px] rounded-full bg-ink" />
            Record a tab
          </Button>
          <Button variant="secondary" size="lg" className="!font-normal" onClick={() => fileInput.current?.click()} disabled={busy}>
            Browse files
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            tabIndex={-1}
            aria-label="Upload a screen recording"
            data-testid="file-input"
            onChange={(e) => {
              startWithFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {error && (
        <p role="alert" data-testid="upload-error" className="-mt-2 m-0 rounded-[10px] border border-[oklch(0.7_0.18_30/0.4)] bg-[rgba(238,107,85,.1)] px-3.5 py-2.5 text-sm text-red-soft">
          {error}
        </p>
      )}

      <form
        className="flex gap-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          autoRecord();
        }}
      >
        <label htmlFor="record-url" className="sr-only">
          Website URL to auto-record
        </label>
        <input
          id="record-url"
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://paste a URL and we'll record the scroll for you"
          className="h-11 min-w-0 flex-1 rounded-[10px] border border-edge bg-panel px-3.5 font-mono text-[13px] text-fg placeholder:text-fg-faint focus:border-edge-4 focus-visible:outline-2"
        />
        <Button type="submit" variant="secondary" className="!h-11 !rounded-[10px] !px-4" disabled={busy}>
          Auto-record
        </Button>
      </form>

      <span className="text-sm text-fg-dim">
        No recording yet? <Link href={routes.templates}>Start from a sample</Link>
      </span>

      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-2.5 p-0 font-mono text-[11px] font-semibold text-fg-dim">OUTPUT · pick any</legend>
        <div className="flex flex-wrap gap-2">
          {OUTPUT_CHOICES.map((o) => {
            const on = outputs.includes(o);
            return (
              <button
                key={o}
                type="button"
                aria-pressed={on}
                onClick={() => toggleOutput(o)}
                className={cn(
                  "rounded-lg border px-3 py-[7px] font-mono text-[13px] transition-colors",
                  on ? "border-fg bg-fg text-ink" : "border-edge-2 text-fg-muted hover:text-fg",
                )}
              >
                {o}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
