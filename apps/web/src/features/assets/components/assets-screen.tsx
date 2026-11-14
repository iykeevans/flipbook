"use client";

import { useEffect, useState } from "react";
import { Button, MonoNote, PageTitle, Segmented } from "@/components/ui";
import { COLORS } from "@/lib/domain/constants";
import type { Asset, AssetGroup, AssetLibrary } from "@/lib/domain/types";
import { useAppStore } from "@/lib/store/app-store";
import { useProject } from "@/features/project";

const STATUS_COLOR: Record<Asset["certainty"], string> = { observed: COLORS.mint, inferred: COLORS.yellow, neutral: COLORS.neutral, placeholder: COLORS.yellow };

export function AssetsScreen() {
  const project = useProject();
  const assets = useAppStore((s) => s.cache[project.id]?.assets);
  const loadAssets = useAppStore((s) => s.loadAssets);

  useEffect(() => {
    if (!assets) void loadAssets(project.id);
  }, [assets, loadAssets, project.id]);

  if (!assets) return <MonoNote className="text-fg-faint">Loading assets…</MonoNote>;
  return <AssetsBody library={assets} />;
}

function AssetsBody({ library }: { library: AssetLibrary }) {
  const project = useProject();
  const replaceAsset = useAppStore((s) => s.replaceAsset);
  const [tab, setTab] = useState<AssetGroup["id"]>("images");
  const group = library.groups.find((g) => g.id === tab) ?? library.groups[0]!;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle size="md">Assets</PageTitle>
        <Segmented<AssetGroup["id"]>
          label="Asset type"
          options={library.groups.map((g) => ({ value: g.id, label: g.id === "recording" ? g.label : `${g.label} · ${g.count}` }))}
          value={tab}
          onChange={setTab}
        />
      </div>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,180px),1fr))] gap-3.5 p-0" data-testid="asset-grid">
        {group.items.map((a) => (
          <li key={a.id} className="flex flex-col gap-1.5" data-testid={`asset-${a.id}`}>
            <Thumb asset={a} />
            <span className="text-sm">{a.name}</span>
            <span className="font-mono text-xs" style={{ color: STATUS_COLOR[a.certainty] }}>
              {a.status}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-panel px-4 py-3.5">
        <span className="text-sm text-fg-muted">Replacing an asset updates every component that uses it and saves a version.</span>
        <Button
          onClick={async () => {
            await replaceAsset(project.id, "card-2");
            setTab("images");
          }}
        >
          {library.card2Replaced ? "Upload replacement" : "Replace card-2"}
        </Button>
      </div>
    </div>
  );
}

function Thumb({ asset }: { asset: Asset }) {
  const base = "grid h-[110px] place-items-center rounded-[10px]";
  if (asset.certainty === "placeholder") {
    return (
      <div className={`${base} border-[1.5px] border-dashed border-yellow font-mono text-xs text-yellow`} data-testid="placeholder-thumb">
        {asset.thumb}
      </div>
    );
  }
  if (asset.kind === "font") {
    return (
      <div className={`${base} bg-panel text-fg ${asset.fontFamily === "mono" ? "font-mono text-[32px]" : "text-[36px] font-extrabold"}`} aria-hidden>
        {asset.thumb}
      </div>
    );
  }
  return (
    <div className={`${base} bg-stripe font-mono ${asset.kind === "recording" ? "text-[28px] text-fg-dim" : "text-[11px] text-fg-ghost"}`} aria-hidden>
      {asset.kind === "image" ? "" : asset.thumb}
    </div>
  );
}
