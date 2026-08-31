"use client";

import { DocumentLibrary } from "./DocumentLibrary";
import { TextBlockGroup } from "./TextBlockGroup";

export function OperationsPanel() {
  return (
    <div className="fo-stack">
      <DocumentLibrary section="sop" title="Operations / SOPs" subtitle="Lead capture → qualification → sales → onboarding → delivery → support → retention" addLabel="Add a section…" />
      <DocumentLibrary section="template" title="Document Templates" addLabel="Add a template…" />
      <TextBlockGroup section="hiring" title="Hiring & Team Structure" />
    </div>
  );
}
