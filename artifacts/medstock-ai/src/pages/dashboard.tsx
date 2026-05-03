import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  useGetDashboardSummary, useGetWastageTrend, useGetAlertsFeed, useGetStockByStatus
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle, Package, AlertTriangle, TrendingDown, Clock,
  TrendingUp, Zap, FileDown, CheckCheck, RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area
} from "recharts";

/* ── spring cubic-bezier from high-end-visual-design skill ────────────────── */
const SPRING = [0.32, 0.72, 0, 1] as const;

/* ── Glass card wrapper — Double-Bezel from high-end-visual-design ─────────── */
function GlassCard({
  children, className = "", style = {}, delay = 0
}: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: SPRING, delay }}
      className={`glass-card rounded-xl overflow-hidden ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ── Time range filter ──────────────────────────────────────────────────────── */
type Range = "today" | "7d" | "30d" | "90d";
const RANGES: { label: string; value: Range }[] = [
  { label: "Today", value: "today" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

/* ── Crisis Risk Gauge (gold glow) ─────────────────────────────────────────── */
function CrisisGauge({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const dash = (pct / 100) * circ;
  const strokeColor = score >= 70 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#C8922A";
  const label = score >= 70 ? "Critical" : score >= 40 ? "Elevated" : "Healthy";
  const glowColor = score >= 70 ? "rgba(239,68,68,0.35)" : score >= 40 ? "rgba(245,158,11,0.3)" : "rgba(200,146,42,0.35)";

  return (
    <div className="flex flex-col items-center gap-3">
      {/* ambient orb behind gauge */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`, filter: "blur(20px)", transform: "scale(1.4)" }}
        />
        <svg width={136} height={136} viewBox="0 0 136 136" style={{ filter: `drop-shadow(0 0 14px ${glowColor})` }}>
          <circle cx={68} cy={68} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
          {/* background tick marks */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * 2 * Math.PI - Math.PI / 2;
            const inner = 42, outer = 46;
            return (
              <line key={i}
                x1={68 + inner * Math.cos(angle)} y1={68 + inner * Math.sin(angle)}
                x2={68 + outer * Math.cos(angle)} y2={68 + outer * Math.sin(angle)}
                stroke="rgba(255,255,255,0.08)" strokeWidth={1}
              />
            );
          })}
          <circle
            cx={68} cy={68} r={r} fill="none"
            stroke={strokeColor} strokeWidth={7}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            transform="rotate(-90 68 68)"
            style={{ transition: "stroke-dasharray 1s cubic-bezier(0.32,0.72,0,1), stroke 0.4s ease" }}
          />
          <text x={68} y={60} textAnchor="middle" fontSize={28} fontWeight={800} fill={strokeColor} fontFamily="Barlow Condensed, sans-serif" letterSpacing="-1">{score}</text>
          <text x={68} y={78} textAnchor="middle" fontSize={10} fill="rgba(237,230,220,0.45)" fontFamily="Inter, sans-serif" letterSpacing="0.08em" textDecoration="uppercase">{label}</text>
        </svg>
      </div>
      <p className="text-xs text-center" style={{ color: "rgba(237,230,220,0.4)" }}>Supply chain risk score</p>
    </div>
  );
}

/* ── Delta chip ────────────────────────────────────────────────────────────── */
function Delta({ value, inverse = false }: { value: number; inverse?: boolean }) {
  const good = inverse ? value < 0 : value > 0;
  return (
    <span
      className="text-xs font-semibold"
      style={{ color: good ? "#22c55e" : "#ef4444" }}
    >
      {value > 0 ? "↑" : "↓"} {Math.abs(value)}% vs last month
    </span>
  );
}

/* ── AI Recommendations ────────────────────────────────────────────────────── */
interface ApiRec {
  id: string;
  priority: "critical" | "high" | "medium";
  type: "reorder" | "reallocate" | "review";
  skuName: string;
  department: string;
  message: string;
  value: number;
}
const PRIORITY_STYLE: Record<ApiRec["priority"], { bar: string; badge: string }> = {
  critical: { bar: "rgba(239,68,68,0.7)", badge: "bg-red-500/10 text-red-400 border border-red-500/20" },
  high:     { bar: "rgba(200,146,42,0.7)", badge: "bg-[rgba(200,146,42,0.1)] text-[#E8B84B] border border-[rgba(200,146,42,0.2)]" },
  medium:   { bar: "rgba(96,165,250,0.6)", badge: "bg-blue-400/10 text-blue-400 border border-blue-400/20" },
};

function AIRecommendations() {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  const { data: recs = [], isLoading } = useQuery<ApiRec[]>({
    queryKey: ["dashboard", "ai-recommendations"],
    queryFn: async () => {
      const res = await fetch(`${base}/api/dashboard/ai-recommendations`);
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json();
    },
    staleTime: 60_000,
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(200,146,42,0.25), rgba(200,146,42,0.1))", border: "1px solid rgba(200,146,42,0.25)" }}
        >
          <Zap className="w-3.5 h-3.5 text-[#C8922A]" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">AI Recommendations</h3>
        {!isLoading && (
          <span
            className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(200,146,42,0.15)", color: "#E8B84B", border: "1px solid rgba(200,146,42,0.2)" }}
          >
            {recs.length} action{recs.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <p className="text-xs mb-4" style={{ color: "rgba(237,230,220,0.4)" }}>Ranked by urgency and estimated impact</p>
      <div className="space-y-3 flex-1">
        {isLoading ? (
          [1, 2, 3].map(n => <Skeleton key={n} className="h-20 w-full rounded-lg" />)
        ) : recs.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm" style={{ color: "rgba(237,230,220,0.3)" }}>
            All stock levels healthy — no actions needed
          </div>
        ) : recs.map((rec, i) => {
          const s = PRIORITY_STYLE[rec.priority];
          const actionLabel = rec.type === "reorder" ? "Raise PO" : rec.type === "reallocate" ? "Transfer" : "Review";
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: SPRING }}
              className="relative rounded-lg p-3 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ background: s.bar }} />
              <div className="pl-2 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${s.badge}`}>
                      {rec.priority}
                    </span>
                    <span className="text-[10px]" style={{ color: "rgba(237,230,220,0.3)" }}>{rec.department}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{rec.skuName}</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(237,230,220,0.45)" }}>{rec.message}</p>
                  {rec.value > 0 && (
                    <p className="text-xs text-green-400 font-medium mt-1.5">≈ ₹{rec.value.toLocaleString()} impact</p>
                  )}
                </div>
                <button
                  className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300 whitespace-nowrap hover:opacity-80"
                  style={{ background: "rgba(200,146,42,0.1)", border: "1px solid rgba(200,146,42,0.2)", color: "#E8B84B" }}
                >
                  {actionLabel}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Savings widget ─────────────────────────────────────────────────────────── */
function SavingsWidget({ wastage }: { wastage?: number }) {
  const baselineLoss = wastage ? wastage * 2.4 : 0;
  const saved = wastage ? baselineLoss - wastage : 0;
  const pct = baselineLoss > 0 ? Math.round((saved / baselineLoss) * 100) : 0;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-green-400" />
        <span className="text-sm font-medium" style={{ color: "rgba(237,230,220,0.6)" }}>AI Savings This Month</span>
      </div>
      <div
        className="text-4xl font-extrabold text-green-400"
        style={{ fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "-0.02em" }}
      >
        ₹{saved.toLocaleString()}
      </div>
      <p className="text-xs mt-1" style={{ color: "rgba(237,230,220,0.35)" }}>vs estimated baseline without AI</p>
      <div
        className="mt-4 h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.1)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: SPRING, delay: 0.4 }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #16a34a, #22c55e)" }}
        />
      </div>
      <p className="text-xs text-green-400 font-semibold mt-1.5">{pct}% waste reduction achieved</p>
    </div>
  );
}

/* ── Quick Actions ──────────────────────────────────────────────────────────── */
function QuickActions() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEmergencyOrder = () => navigate("/app/crisis");

  const handleAckAll = async () => {
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const alertsRes = await fetch(`${base}/api/dashboard/alerts-feed`);
      const alerts: Array<{ id: number }> = alertsRes.ok ? await alertsRes.json() : [];
      await Promise.all(
        alerts.map(a =>
          fetch(`${base}/api/alerts/${a.id}/resolve`, { method: "POST" })
        )
      );
      await queryClient.invalidateQueries();
      toast({ title: `${alerts.length} alerts acknowledged`, description: "All active alerts marked as resolved" });
    } catch {
      toast({ title: "Failed to acknowledge alerts", variant: "destructive" });
    }
  };

  const handleExport = async () => {
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/inventory`);
      const items: Array<{ skuId?: number; name?: string; category?: string; departmentName?: string; currentStock?: number; unit?: string; reorderPoint?: number; safetyStock?: number; status?: string }> = res.ok ? await res.json() : [];
      const headers = ["SKU ID", "Name", "Category", "Department", "Current Stock", "Unit", "Reorder Point", "Safety Stock", "Status"];
      const rows = items.map((i) =>
        [i.skuId, i.name, i.category, i.departmentName, i.currentStock, i.unit, i.reorderPoint, i.safetyStock, i.status].join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `medstock-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast({ title: "Report exported", description: `${items.length} SKUs exported to CSV` });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  const handleSyncERP = () => {
    toast({ title: "ERP sync unavailable", description: "Connect a real ERP integration before enabling sync", variant: "destructive" });
  };

  const actions = [
    { icon: <Zap className="w-3.5 h-3.5" />, label: "Emergency Order", onClick: handleEmergencyOrder,
      style: { color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" } },
    { icon: <CheckCheck className="w-3.5 h-3.5" />, label: "Ack All Alerts", onClick: handleAckAll,
      style: { color: "#E8B84B", background: "rgba(200,146,42,0.08)", border: "1px solid rgba(200,146,42,0.18)" } },
    { icon: <FileDown className="w-3.5 h-3.5" />, label: "Export Report", onClick: handleExport,
      style: { color: "#60a5fa", background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)" } },
    { icon: <RefreshCw className="w-3.5 h-3.5" />, label: "Sync ERP", onClick: handleSyncERP,
      style: { color: "rgba(237,230,220,0.5)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" } },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-300 hover:opacity-80 active:scale-[0.97]"
          style={a.style}
        >
          {a.icon}{a.label}
        </button>
      ))}
    </div>
  );
}

/* ── Supplier Performance ───────────────────────────────────────────────────── */
interface SupplierData { name: string; fill: number; skuCount: number; criticalCount: number }

function SupplierPerformance() {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  const { data: suppliers = [], isLoading } = useQuery<SupplierData[]>({
    queryKey: ["dashboard", "supplier-performance"],
    queryFn: async () => {
      const res = await fetch(`${base}/api/dashboard/supplier-performance`);
      if (!res.ok) throw new Error("Failed to fetch supplier data");
      return res.json();
    },
    staleTime: 60_000,
  });

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-1">Supplier Performance</h3>
      <p className="text-xs mb-4" style={{ color: "rgba(237,230,220,0.4)" }}>Stock fill rate by supplier</p>
      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3, 4].map(n => <Skeleton key={n} className="h-8 w-full" />)
        ) : suppliers.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm" style={{ color: "rgba(237,230,220,0.3)" }}>
            No supplier data — add supplier names to SKUs
          </div>
        ) : suppliers.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.08, duration: 0.4, ease: SPRING }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-foreground">{s.name}</span>
              <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(237,230,220,0.45)" }}>
                <span>{s.skuCount} SKUs</span>
                <span className="font-bold" style={{ color: s.fill >= 90 ? "#22c55e" : s.fill >= 75 ? "#E8B84B" : "#ef4444" }}>
                  {s.fill}%
                </span>
              </div>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.fill}%` }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.8, ease: SPRING }}
                className="h-full rounded-full"
                style={{
                  background: s.fill >= 90 ? "linear-gradient(90deg, #16a34a, #22c55e)"
                    : s.fill >= 75 ? "linear-gradient(90deg, #C8922A, #E8B84B)"
                    : "linear-gradient(90deg, #dc2626, #ef4444)"
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Recharts tooltip style ─────────────────────────────────────────────────── */
const TOOLTIP_STYLE = {
  backgroundColor: "hsl(250,28%,7%)",
  borderColor: "rgba(200,146,42,0.2)",
  borderRadius: "10px",
  border: "1px solid rgba(200,146,42,0.2)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
};

/* ── Main Dashboard ─────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [range, setRange] = useState<Range>("30d");
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: trend, isLoading: loadingTrend } = useGetWastageTrend();
  const { data: alerts, isLoading: loadingAlerts } = useGetAlertsFeed();
  const { data: stockStatus, isLoading: loadingStockStatus } = useGetStockByStatus();

  const crisisScore = useMemo(() => {
    if (!summary) return 0;
    const critW = (summary.criticalItems ?? 0) * 8;
    const lowW = (summary.lowItems ?? 0) * 3;
    const expiryW = (summary.expiringWithin30Days ?? 0) * 2;
    return Math.min(100, Math.round((critW + lowW + expiryW) / 4));
  }, [summary]);

  const METRIC_CARDS = [
    {
      title: "Critical Items", value: summary?.criticalItems,
      icon: <AlertCircle className="w-4 h-4" style={{ color: "#ef4444" }} />,
      desc: "Stockouts or near empty", delta: -14, inverse: true,
      accent: "rgba(239,68,68,0.12)", accentBorder: "rgba(239,68,68,0.15)",
    },
    {
      title: "Low Stock", value: summary?.lowItems,
      icon: <AlertTriangle className="w-4 h-4" style={{ color: "#E8B84B" }} />,
      desc: "Below safety threshold", delta: -8, inverse: true,
      accent: "rgba(200,146,42,0.1)", accentBorder: "rgba(200,146,42,0.15)",
    },
    {
      title: "Expiring < 30 Days", value: summary?.expiringWithin30Days,
      icon: <TrendingDown className="w-4 h-4" style={{ color: "#E8B84B" }} />,
      desc: "Needs urgent attention", delta: -22, inverse: true,
      accent: "rgba(200,146,42,0.08)", accentBorder: "rgba(200,146,42,0.12)",
    },
    {
      title: "Total SKUs Monitored", value: summary?.totalSkus,
      icon: <Package className="w-4 h-4" style={{ color: "rgba(237,230,220,0.4)" }} />,
      desc: "Across all departments", delta: 6, inverse: false,
      accent: "rgba(255,255,255,0.02)", accentBorder: "rgba(255,255,255,0.08)",
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: SPRING }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #EDE6DC 0%, #C8922A 50%, #EDE6DC 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontFamily: "Barlow Condensed, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Command Center
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(237,230,220,0.4)" }}>
            AI-powered supply chain intelligence — live
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <QuickActions />
          <div
            className="flex items-center gap-0.5 p-1 rounded-lg text-sm"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-300"
                style={range === r.value ? {
                  background: "rgba(200,146,42,0.15)",
                  color: "#E8B84B",
                  border: "1px solid rgba(200,146,42,0.2)",
                  boxShadow: "0 0 12px rgba(200,146,42,0.1)",
                } : { color: "rgba(237,230,220,0.4)" }}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(237,230,220,0.35)" }}>
            <span>{format(new Date(), "HH:mm:ss")}</span>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.5)", animation: "pulse 2s infinite" }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── KPI bento grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {METRIC_CARDS.map((m, i) => (
          <GlassCard key={m.title} delay={i * 0.07} style={{ background: m.accent, borderColor: m.accentBorder }}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: "rgba(237,230,220,0.45)" }}>{m.title}</span>
                {m.icon}
              </div>
              {loadingSummary ? (
                <Skeleton className="h-9 w-14 mb-1" />
              ) : (
                <div
                  className="text-3xl font-extrabold text-foreground"
                  style={{ fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "-0.02em" }}
                >
                  {m.value !== undefined ? m.value.toLocaleString() : "—"}
                </div>
              )}
              <p className="text-xs mt-0.5" style={{ color: "rgba(237,230,220,0.35)" }}>{m.desc}</p>
              {!loadingSummary && (
                <div className="mt-2">
                  <Delta value={m.delta} inverse={m.inverse} />
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* ── Row 2: Crisis gauge + AI Recommendations (asymmetric bento) ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Crisis gauge — 1 col */}
        <GlassCard delay={0.28}>
          <div className="p-5 flex flex-col items-center gap-4">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-foreground">Crisis Risk Score</h3>
              <p className="text-xs mt-0.5" style={{ color: "rgba(237,230,220,0.4)" }}>Overall supply chain health</p>
            </div>
            {loadingSummary
              ? <Skeleton className="w-36 h-36 rounded-full" />
              : <CrisisGauge score={crisisScore} />
            }
            <div className="grid grid-cols-3 gap-2 w-full text-center">
              {[
                { label: "Forecast accuracy", value: `${summary?.forecastAccuracy ?? "—"}%`, color: "#22c55e" },
                { label: "Stockouts", value: summary?.stockoutIncidentsThisMonth ?? "—", color: "#ef4444" },
                { label: "Wastage cost", value: summary?.estimatedMonthlyWastageCost ? `₹${(summary.estimatedMonthlyWastageCost / 1000).toFixed(0)}k` : "—", color: "#E8B84B" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-2 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {loadingSummary
                    ? <Skeleton className="h-6 w-10 mx-auto mb-1" />
                    : <div className="text-lg font-bold" style={{ fontFamily: "Barlow Condensed", color: s.color }}>{s.value}</div>
                  }
                  <div className="text-[10px] leading-tight mt-0.5" style={{ color: "rgba(237,230,220,0.35)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* AI Recommendations — 2 col */}
        <GlassCard delay={0.35} className="lg:col-span-2">
          <div className="p-5 h-full">
            <AIRecommendations />
          </div>
        </GlassCard>
      </div>

      {/* ── Row 3: Savings + Wastage trend ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard
          delay={0.42}
          style={{ background: "rgba(34,197,94,0.04)", borderColor: "rgba(34,197,94,0.12)" }}
        >
          <div className="p-5">
            <SavingsWidget wastage={summary?.estimatedMonthlyWastageCost} />
          </div>
        </GlassCard>

        <GlassCard delay={0.48} className="lg:col-span-2">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Wastage Trend</h3>
                <p className="text-xs mt-0.5" style={{ color: "rgba(237,230,220,0.4)" }}>Expired vs near-expiry risk value over time</p>
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(200,146,42,0.1)", color: "#E8B84B", border: "1px solid rgba(200,146,42,0.2)" }}
              >
                {range}
              </span>
            </div>
            <div className="h-[220px]">
              {loadingTrend ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend || []}>
                    <defs>
                      <linearGradient id="expiredGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C8922A" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#C8922A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="rgba(237,230,220,0.25)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(237,230,220,0.25)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <RechartsTooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: "#EDE6DC" }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "rgba(237,230,220,0.5)" }} />
                    <Area type="monotone" name="Expired Value" dataKey="expiredValue" stroke="#ef4444" fill="url(#expiredGrad)" strokeWidth={1.5} dot={{ r: 2.5, fill: "#ef4444" }} />
                    <Area type="monotone" name="Near Expiry Risk" dataKey="nearExpiryRisk" stroke="#C8922A" fill="url(#riskGrad)" strokeWidth={1.5} dot={{ r: 2.5, fill: "#C8922A" }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Row 4: Dept chart + Alerts + Supplier ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard delay={0.55}>
          <div className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Stock by Department</h3>
            <p className="text-xs mb-4" style={{ color: "rgba(237,230,220,0.4)" }}>Adequate · Low · Critical SKU counts</p>
            <div className="h-[260px]">
              {loadingStockStatus ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockStatus?.byDepartment || []} layout="vertical" margin={{ top: 0, right: 16, left: 16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="rgba(237,230,220,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis dataKey="departmentName" type="category" stroke="rgba(237,230,220,0.2)" fontSize={10} tickLine={false} axisLine={false} width={80} />
                    <RechartsTooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "rgba(237,230,220,0.5)" }} />
                    <Bar name="Adequate" dataKey="adequate" stackId="a" fill="#22c55e" opacity={0.85} />
                    <Bar name="Low" dataKey="low" stackId="a" fill="#C8922A" opacity={0.85} />
                    <Bar name="Critical" dataKey="critical" stackId="a" fill="#ef4444" opacity={0.85} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.6}>
          <div className="p-5 pb-0">
            <h3 className="text-sm font-semibold text-foreground mb-1">Recent Alerts</h3>
            <p className="text-xs mb-3" style={{ color: "rgba(237,230,220,0.4)" }}>Active notifications requiring action</p>
          </div>
          <ScrollArea className="h-[280px]">
            {loadingAlerts ? (
              <div className="p-5 space-y-4">
                {[1, 2, 3].map((n) => <Skeleton key={n} className="h-12 w-full" />)}
              </div>
            ) : alerts?.length === 0 ? (
              <div
                className="flex items-center justify-center h-48 text-sm"
                style={{ color: "rgba(237,230,220,0.3)" }}
              >
                No active alerts
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {alerts?.map((alert, i) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 + i * 0.06 }}
                    className="p-4 flex items-start gap-3 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="mt-0.5 shrink-0">
                      {alert.severity === "critical"
                        ? <AlertCircle className="w-4 h-4 text-red-400" />
                        : alert.severity === "warning"
                          ? <AlertTriangle className="w-4 h-4" style={{ color: "#E8B84B" }} />
                          : <Clock className="w-4 h-4" style={{ color: "rgba(237,230,220,0.35)" }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                        <span className="text-[10px] whitespace-nowrap" style={{ color: "rgba(237,230,220,0.3)" }}>
                          {format(new Date(alert.createdAt), "MMM d, HH:mm")}
                        </span>
                      </div>
                      <p className="text-xs line-clamp-1 mt-0.5" style={{ color: "rgba(237,230,220,0.4)" }}>{alert.message}</p>
                      {(alert.skuName || alert.departmentName) && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {alert.skuName && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{ background: "rgba(200,146,42,0.1)", color: "#E8B84B", border: "1px solid rgba(200,146,42,0.15)" }}
                            >
                              {alert.skuName}
                            </span>
                          )}
                          {alert.departmentName && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(237,230,220,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                              {alert.departmentName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </GlassCard>

        <GlassCard delay={0.65}>
          <div className="p-5">
            <SupplierPerformance />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
