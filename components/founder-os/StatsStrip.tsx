"use client";

import { Empty } from "../ui";
import type { FoStatTile } from "@/lib/types";

/**
 * Renders whatever tiles it's handed — never a hardcoded grid. Phase 2
 * (Finance/Legal) adds more entries to the array server-side; this
 * component doesn't change.
 */
export function StatsStrip({ tiles }: { tiles: FoStatTile[] }) {
  if (tiles.length === 0) return <Empty title="No stats yet" />;

  return (
    <div className="kpi-grid">
      {tiles.map((tile) => (
        <div className={`kpi${tile.tone && tile.tone !== "default" ? ` ${tile.tone}` : ""}`} key={tile.id}>
          <div className="kpi-value">{tile.value}</div>
          <div className="kpi-label">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}
