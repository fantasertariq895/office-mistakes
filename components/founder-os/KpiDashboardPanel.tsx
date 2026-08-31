"use client";

import { useMemo } from "react";
import { useApp } from "../AppProvider";
import { Card, SkeletonList } from "../ui";
import { FOUNDER_STARTUP_BUDGET_CAP_CAD } from "@/lib/constants";
import { useFetch } from "@/lib/hooks";
import type { FoCostItem, FoPipelineContact, FoRevenueMonth } from "@/lib/types";

const cad = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

/**
 * Financial / Sales / Customer, each its own group — pre-revenue metrics
 * shown prominently, post-revenue-only ones (MRR, churn) only once there's
 * at least one closed client, per the source doc's explicit instruction not
 * to show metrics that don't apply yet.
 */
export function KpiDashboardPanel() {
  const { version } = useApp();
  const { data: pipelineData, loading } = useFetch<{ contacts: FoPipelineContact[] }>(
    "/api/founder-os/pipeline",
    version
  );
  const { data: costData } = useFetch<{ costs: FoCostItem[] }>("/api/founder-os/costs", version);
  const { data: revenueData } = useFetch<{ months: FoRevenueMonth[] }>("/api/founder-os/revenue", version);

  const contacts = useMemo(() => pipelineData?.contacts ?? [], [pipelineData]);
  const costs = useMemo(() => costData?.costs ?? [], [costData]);
  const months = useMemo(() => revenueData?.months ?? [], [revenueData]);

  if (loading && contacts.length === 0) {
    return (
      <Card headerless>
        <SkeletonList rows={4} />
      </Card>
    );
  }

  const oneTimeSpend = costs.filter((c) => c.type === "one_time").reduce((s, c) => s + c.amountCad, 0);
  const monthlyRecurring = costs.filter((c) => c.type === "recurring").reduce((s, c) => s + c.amountCad, 0);
  const totalForecastRevenue = months.reduce((s, m) => s + m.clients * m.avgRevenuePerClient, 0);
  const cashRemaining = FOUNDER_STARTUP_BUDGET_CAP_CAD - oneTimeSpend;

  const totalContacts = contacts.length;
  const replied = contacts.filter((c) => c.status !== "contacted").length;
  const callsBooked = contacts.filter((c) => ["call_booked", "proposal_sent", "closed"].includes(c.status)).length;
  const proposalsSent = contacts.filter((c) => ["proposal_sent", "closed"].includes(c.status)).length;
  const closed = contacts.filter((c) => c.status === "closed").length;
  const replyRate = totalContacts === 0 ? null : Math.round((replied / totalContacts) * 100);
  const conversionRate = totalContacts === 0 ? null : Math.round((closed / totalContacts) * 100);

  return (
    <div className="fo-stack">
      <Card title="Financial">
        <div className="kpi-grid">
          <div className="kpi">
            <div className="kpi-value">{cad(totalForecastRevenue)}</div>
            <div className="kpi-label">Forecasted revenue (12mo)</div>
          </div>
          <div className="kpi">
            <div className="kpi-value">{cad(oneTimeSpend)}</div>
            <div className="kpi-label">One-time spend so far</div>
          </div>
          <div className="kpi">
            <div className="kpi-value">{cad(monthlyRecurring)}/mo</div>
            <div className="kpi-label">Recurring costs</div>
          </div>
          <div className={`kpi${cashRemaining < 0 ? " alert" : ""}`}>
            <div className="kpi-value">{cad(cashRemaining)}</div>
            <div className="kpi-label">Cash remaining vs ${FOUNDER_STARTUP_BUDGET_CAP_CAD.toLocaleString()} cap</div>
          </div>
        </div>
      </Card>

      <Card title="Sales">
        <div className="kpi-grid">
          <div className="kpi">
            <div className="kpi-value">{totalContacts}</div>
            <div className="kpi-label">Contacts made</div>
          </div>
          <div className="kpi">
            <div className="kpi-value">{replyRate === null ? "—" : `${replyRate}%`}</div>
            <div className="kpi-label">Reply rate</div>
          </div>
          <div className="kpi">
            <div className="kpi-value">{callsBooked}</div>
            <div className="kpi-label">Calls booked</div>
          </div>
          <div className="kpi">
            <div className="kpi-value">{proposalsSent}</div>
            <div className="kpi-label">Proposals sent</div>
          </div>
          <div className="kpi">
            <div className="kpi-value">{conversionRate === null ? "—" : `${conversionRate}%`}</div>
            <div className="kpi-label">Conversion rate</div>
          </div>
        </div>
      </Card>

      <Card title="Customer">
        <div className="kpi-grid">
          <div className="kpi success">
            <div className="kpi-value">{closed}</div>
            <div className="kpi-label">Clients closed</div>
          </div>
          {closed > 0 ? (
            <div className="kpi">
              <div className="kpi-value">—</div>
              <div className="kpi-label">Retention</div>
            </div>
          ) : (
            <p className="fo-kpi-hidden-note">Retention isn&apos;t tracked yet — it applies once you have a client.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
