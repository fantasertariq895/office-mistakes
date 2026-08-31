"use client";

import { useState } from "react";
import { useApp } from "../AppProvider";
import { Card, SkeletonList } from "../ui";
import { api } from "@/lib/client";
import { useFetch } from "@/lib/hooks";
import type { FoTextBlock } from "@/lib/types";

function TextBlockField({ block, onSave }: { block: FoTextBlock; onSave: (content: string) => void }) {
  const [draft, setDraft] = useState(block.content ?? "");

  return (
    <div className="fo-textblock">
      <label htmlFor={`fo-tb-${block.id}`}>{block.label}</label>
      <textarea
        id={`fo-tb-${block.id}`}
        className="input fo-textblock-input"
        rows={2}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== (block.content ?? "")) onSave(draft);
        }}
      />
    </div>
  );
}

/**
 * A labeled group of freeform text fields, one Card, backing whichever
 * FounderTextBlock `section` is asked for — Business Model Canvas, Ideal
 * Customer Profile, Brand & Website copy, Hiring notes, Funding Notes, and
 * the 12-Month Roadmap are all this same shape underneath (a handful of
 * named text fields), so they share this one component rather than each
 * getting a bespoke form.
 */
export function TextBlockGroup({
  section,
  title,
  subtitle,
}: {
  section: string;
  title: string;
  subtitle?: string;
}) {
  const { bump, version, pushToast } = useApp();
  const { data, loading, reload } = useFetch<{ blocks: FoTextBlock[] }>(
    `/api/founder-os/text-blocks?section=${section}`,
    version
  );
  const blocks = data?.blocks ?? [];

  const save = async (block: FoTextBlock, content: string) => {
    try {
      await api.patch(`/api/founder-os/text-blocks/${block.id}`, { content });
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
    <Card title={title} subtitle={subtitle}>
      {loading && blocks.length === 0 ? (
        <SkeletonList rows={3} />
      ) : (
        <div className="fo-textblock-group">
          {blocks.map((block) => (
            <TextBlockField key={block.id} block={block} onSave={(content) => save(block, content)} />
          ))}
        </div>
      )}
    </Card>
  );
}
