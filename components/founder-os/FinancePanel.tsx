"use client";

import { useMemo, useState } from "react";
import { useApp } from "../AppProvider";
import { Card, SkeletonList } from "../ui";
import { api } from "@/lib/client";
import {
  FOUNDER_COST_TYPES,
  FOUNDER_COST_TYPE_LABELS,
  FOUNDER_STARTUP_BUDGET_CAP_CAD,
} from "@/lib/constants";
import { useFetch } from "@/lib/hooks";
import type { FoCostItem, FoPricingTier, FoRevenueMonth } from "@/lib/types";
import { SimpleTable, type SimpleTableColumn } from "./SimpleTable";

const cad = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

/* ------------------------------------------------------------ cost tracker */

function CostTracker() {
  const { bump, version, pushToast } = useApp();
  const { data, reload } = useFetch<{ costs: FoCostItem[] }>("/api/founder-os/costs", version);
  const costs = data?.costs ?? [];
  const oneTime = costs.filter((c) => c.type === "one_time").reduce((s, c) => s + c.amountCad, 0);
  const recurring = costs.filter((c) => c.type === "recurring").reduce((s, c) => s + c.amountCad, 0);
  const overCap = oneTime > FOUNDER_STARTUP_BUDGET_CAP_CAD;

  const columns: SimpleTableColumn<FoCostItem>[] = [
    { key: "name", label: "Item", type: "text", width: "1.6fr" },
    {
      key: "type",
      label: "Type",
      type: "select",
      width: "0.8fr",
      options: FOUNDER_COST_TYPES.map((t) => ({ value: t, label: FOUNDER_COST_TYPE_LABELS[t] })),
    },
    { key: "amountCad", label: "CAD", type: "number", width: "0.7fr" },
  ];

  const saveField = async (row: FoCostItem, field: string, value: unknown) => {
    try {
      await api.patch(`/api/founder-os/costs/${row.id}`, { [field]: value });
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not save", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  const remove = async (row: FoCostItem) => {
    try {
      await api.del(`/api/founder-os/costs/${row.id}`);
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not delete", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  const add = async () => {
    try {
      await api.post("/api/founder-os/costs", { name: "New item", type: "one_time", amountCad: 0 });
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not add item", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  return (
    <>
      <SimpleTable
        title="Startup Cost Tracker"
        subtitle={`One-time: ${cad(oneTime)} of ${cad(FOUNDER_STARTUP_BUDGET_CAP_CAD)} cap · Recurring: ${cad(recurring)}/mo`}
        columns={columns}
        rows={costs}
        onSaveField={saveField}
        onDelete={remove}
        onAdd={add}
        addLabel="Add cost"
      />
      {overCap && (
        <p className="fo-warning">
          One-time spend (${oneTime.toLocaleString()}) is over the ${FOUNDER_STARTUP_BUDGET_CAP_CAD.toLocaleString()} CAD cap.
        </p>
      )}
    </>
  );
}

/* -------------------------------------------------------- revenue forecast */

function RevenueForecast() {
  const { bump, version, pushToast } = useApp();
  const { data, reload } = useFetch<{ months: FoRevenueMonth[] }>("/api/founder-os/revenue", version);
  const months = data?.months ?? [];

  const save = async (row: FoRevenueMonth, field: string, value: unknown) => {
    try {
      await api.patch(`/api/founder-os/revenue/${row.id}`, { [field]: value });
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not save", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  return (
    <Card title="Revenue Forecast" subtitle="Months 1–12 — edit clients, average revenue and delivery cost per month" bodyClass="card-body flush">
      <div className="fo-table" style={{ overflowX: "auto" }}>
        <div className="fo-table-head" style={{ gridTemplateColumns: "0.5fr 1fr 1fr 1fr 1fr" }} aria-hidden="true">
          <span>Month</span>
          <span># Clients</span>
          <span>Avg Rev/Client</span>
          <span>Cost of Delivery</span>
          <span>Gross Revenue</span>
        </div>
        {months.map((m) => {
          const gross = m.clients * m.avgRevenuePerClient;
          return (
            <div className="fo-table-row" style={{ gridTemplateColumns: "0.5fr 1fr 1fr 1fr 1fr" }} key={m.id}>
              <span>Month {m.monthNumber}</span>
              <input
                type="number"
                className="input"
                aria-label={`Clients in month ${m.monthNumber}`}
                value={m.clients}
                onChange={(e) => save(m, "clients", Number(e.target.value) || 0)}
              />
              <input
                type="number"
                className="input"
                aria-label={`Average revenue per client in month ${m.monthNumber}`}
                value={m.avgRevenuePerClient}
                onChange={(e) => save(m, "avgRevenuePerClient", Number(e.target.value) || 0)}
              />
              <input
                type="number"
                className="input"
                aria-label={`Cost of delivery in month ${m.monthNumber}`}
                value={m.costOfDelivery}
                onChange={(e) => save(m, "costOfDelivery", Number(e.target.value) || 0)}
              />
              <span>{cad(gross)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ----------------------------------------------------------- pricing tiers */

function PricingTiers() {
  const { bump, version, pushToast } = useApp();
  const { data, reload } = useFetch<{ tiers: FoPricingTier[] }>("/api/founder-os/pricing", version);
  const tiers = data?.tiers ?? [];

  const save = async (row: FoPricingTier, field: string, value: unknown) => {
    try {
      await api.patch(`/api/founder-os/pricing/${row.id}`, { [field]: value });
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not save", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  return (
    <Card title="Pricing Tiers" subtitle="Reference anchor: competitors price $100–200/user/month for the 10–150 user tier">
      <div className="fo-pricing-grid">
        {tiers.map((tier) => (
          <div className="fo-pricing-tier" key={tier.id}>
            <h3>{tier.name}</h3>
            <input
              type="number"
              className="input"
              placeholder="Price CAD/user/mo"
              aria-label={`Price for ${tier.name}`}
              value={tier.priceCad ?? ""}
              onChange={(e) => save(tier, "priceCad", e.target.value === "" ? null : Number(e.target.value))}
            />
            <textarea
              className="input"
              rows={3}
              placeholder="What's included…"
              aria-label={`Description for ${tier.name}`}
              defaultValue={tier.description ?? ""}
              onBlur={(e) => {
                if (e.target.value !== (tier.description ?? "")) save(tier, "description", e.target.value);
              }}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* --------------------------------------------------------- KPI calculator */

const KPI_DEFS = [
  { key: "cac", label: "CAC", def: "Customer Acquisition Cost — what it costs, on average, to land one paying client." },
  { key: "ltv", label: "LTV", def: "Lifetime Value — the total revenue you expect from one client over the whole relationship." },
  { key: "ltv_cac", label: "LTV:CAC", def: "The ratio of the two above — a healthy business is usually 3:1 or higher." },
  { key: "mrr", label: "MRR", def: "Monthly Recurring Revenue — the predictable revenue you can count on next month." },
  { key: "break_even", label: "Break-even point", def: "The point where cumulative revenue covers cumulative costs." },
  { key: "revenue_per_contractor", label: "Revenue per contractor/employee", def: "Total revenue divided by headcount — a rough efficiency check." },
];

function KpiCalculator({ costs, months }: { costs: FoCostItem[]; months: FoRevenueMonth[] }) {
  const [avgClients, setAvgClients] = useState(0);
  const [avgRevenue, setAvgRevenue] = useState(0);
  const [headcount, setHeadcount] = useState(1);

  const totalOneTime = costs.filter((c) => c.type === "one_time").reduce((s, c) => s + c.amountCad, 0);
  const mrr = months.reduce((s, m) => s + m.clients * m.avgRevenuePerClient, 0) / (months.length || 1);
  const totalGross = months.reduce((s, m) => s + m.clients * m.avgRevenuePerClient, 0);

  return (
    <Card title="Key Metrics Calculator" subtitle="Plain-language definitions, since these terms are new to a first-time founder">
      <div className="fo-kpi-inputs row">
        <label>
          Avg. new clients/month
          <input type="number" className="input" value={avgClients} onChange={(e) => setAvgClients(Number(e.target.value) || 0)} />
        </label>
        <label>
          Avg. revenue/client (CAD)
          <input type="number" className="input" value={avgRevenue} onChange={(e) => setAvgRevenue(Number(e.target.value) || 0)} />
        </label>
        <label>
          Headcount
          <input type="number" className="input" value={headcount} onChange={(e) => setHeadcount(Number(e.target.value) || 1)} />
        </label>
      </div>

      <div className="kpi-grid" style={{ marginTop: 14 }}>
        {KPI_DEFS.map((k) => {
          let value = "—";
          if (k.key === "cac" && avgClients > 0) value = cad(totalOneTime / avgClients);
          if (k.key === "ltv") value = cad(avgRevenue * 12);
          if (k.key === "ltv_cac" && avgClients > 0 && totalOneTime > 0) {
            value = `${(((avgRevenue * 12) / (totalOneTime / avgClients)) || 0).toFixed(1)}:1`;
          }
          if (k.key === "mrr") value = cad(mrr);
          if (k.key === "break_even") value = totalGross >= totalOneTime ? "Reached" : cad(totalOneTime - totalGross) + " to go";
          if (k.key === "revenue_per_contractor") value = cad(totalGross / (headcount || 1));
          return (
            <div className="kpi" key={k.key} title={k.def}>
              <div className="kpi-value">{value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          );
        })}
      </div>
      <ul className="fo-kpi-defs">
        {KPI_DEFS.map((k) => (
          <li key={k.key}>
            <strong>{k.label}</strong> — {k.def}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------------------------------------------------------------- panel -- */

export function FinancePanel() {
  const { version } = useApp();
  const { data: costsData, loading } = useFetch<{ costs: FoCostItem[] }>("/api/founder-os/costs", version);
  const { data: revenueData } = useFetch<{ months: FoRevenueMonth[] }>("/api/founder-os/revenue", version);
  const costs = useMemo(() => costsData?.costs ?? [], [costsData]);
  const months = useMemo(() => revenueData?.months ?? [], [revenueData]);

  if (loading && costs.length === 0) {
    return (
      <Card headerless>
        <SkeletonList rows={5} />
      </Card>
    );
  }

  return (
    <div className="fo-stack">
      <CostTracker />
      <RevenueForecast />
      <PricingTiers />
      <KpiCalculator costs={costs} months={months} />
    </div>
  );
}
