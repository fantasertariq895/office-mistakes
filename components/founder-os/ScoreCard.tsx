"use client";

import { useMemo } from "react";
import { useApp } from "../AppProvider";
import { Card, SkeletonList } from "../ui";
import { api } from "@/lib/client";
import { useFetch } from "@/lib/hooks";
import type { FoScore } from "@/lib/types";

/**
 * Business Opportunity Scorecard — 9 editable 1-10 scores, overall computed
 * client-side (never stored, so it's always exactly the average of what's
 * on screen). Deliberately no seeded "good" numbers — the source doc is
 * explicit that inflating these to feel encouraging is the one thing not
 * to do; every score seeds at a neutral 5 for the founder's own honest
 * judgment.
 */
export function ScoreCard() {
  const { bump, version, pushToast } = useApp();
  const { data, loading, reload } = useFetch<{ scores: FoScore[] }>("/api/founder-os/scores", version);
  const scores = data?.scores ?? [];

  const overall = useMemo(() => {
    if (scores.length === 0) return null;
    return Math.round((scores.reduce((sum, s) => sum + s.score, 0) / scores.length) * 10) / 10;
  }, [scores]);

  const save = async (score: FoScore, value: number) => {
    try {
      await api.patch(`/api/founder-os/scores/${score.id}`, { score: value });
      await reload();
      bump();
    } catch (err) {
      pushToast({
        title: "Could not save",
        body: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    }
  };

  return (
    <Card
      title="Business Opportunity Scorecard"
      subtitle={overall !== null ? `Overall: ${overall} / 10` : undefined}
    >
      {loading && scores.length === 0 ? (
        <SkeletonList rows={4} />
      ) : (
        <div className="fo-score-list">
          {scores.map((score) => (
            <div className="fo-score-row" key={score.id}>
              <label htmlFor={`fo-score-${score.id}`}>{score.label}</label>
              <input
                id={`fo-score-${score.id}`}
                type="range"
                min={1}
                max={10}
                value={score.score}
                onChange={(e) => save(score, Number(e.target.value))}
              />
              <span className="fo-score-value">{score.score}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
