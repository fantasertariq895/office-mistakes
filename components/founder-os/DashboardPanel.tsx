"use client";

import { useApp } from "../AppProvider";
import { Card, ErrorState, SkeletonList } from "../ui";
import { api } from "@/lib/client";
import { useFetch } from "@/lib/hooks";
import type { FoDashboard, FoDoNowItem } from "@/lib/types";
import { DoNowWidget } from "./DoNowWidget";
import { RunwayTimeline } from "./RunwayTimeline";
import { StatsStrip } from "./StatsStrip";

export function DashboardPanel({
  onNavigate,
}: {
  onNavigate: (module: "pipeline" | "tasks") => void;
}) {
  const { bump, version, pushToast } = useApp();
  const { data, loading, error, reload } = useFetch<FoDashboard>(
    "/api/founder-os/dashboard",
    version
  );

  const setStartDate = async (value: string) => {
    try {
      await api.patch("/api/founder-os/settings", { startDate: value });
      await reload();
      bump();
    } catch (err) {
      pushToast({
        title: "Could not save the start date",
        body: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    }
  };

  const handleSelect = (item: FoDoNowItem) => {
    onNavigate(item.source === "pipeline" ? "pipeline" : "tasks");
  };

  if (error && !data) {
    return (
      <Card headerless>
        <ErrorState message={error} onRetry={reload} />
      </Card>
    );
  }

  if (loading && !data) {
    return (
      <Card headerless>
        <SkeletonList rows={4} />
      </Card>
    );
  }

  return (
    <div className="fo-dashboard">
      <Card title="90-Day Runway">
        <RunwayTimeline startDate={data?.settings.startDate ?? null} onSetStartDate={setStartDate} />
      </Card>

      <StatsStrip tiles={data?.stats ?? []} />

      <DoNowWidget items={data?.doNow ?? []} onSelect={handleSelect} />
    </div>
  );
}
