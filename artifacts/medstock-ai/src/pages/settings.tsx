import React, { useState } from "react";
import { motion } from "framer-motion";
import { useListHospitals, useListDepartments } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, MapPin, BedDouble, Plus, X, Save,
  Bell, Package, Settings2, ChevronRight, Loader2
} from "lucide-react";

const SPRING = [0.32, 0.72, 0, 1] as const;

function GlassPanel({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: SPRING, delay }}
      className={`glass-card rounded-xl overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 p-5 pb-4" style={{ borderBottom: "1px solid rgba(200,146,42,0.08)" }}>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "rgba(200,146,42,0.12)", border: "1px solid rgba(200,146,42,0.2)" }}
      >
        <span className="text-[#C8922A]">{icon}</span>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs mt-0.5 text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function SettingsInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 rounded-lg text-sm text-foreground focus:outline-none transition-all duration-300 bg-muted border border-border"
      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(200,146,42,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(200,146,42,0.08)"; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = "none"; }}
    />
  );
}

function ThresholdSlider({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span
          className="text-sm font-bold px-2 py-0.5 rounded"
          style={{ background: "rgba(200,146,42,0.1)", color: "#E8B84B", border: "1px solid rgba(200,146,42,0.2)" }}
        >
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

export default function HospitalSettings() {
  const { data: hospitals, isLoading } = useListHospitals();
  const current = hospitals?.find(h => h.isCurrentFacility);
  const { data: departments } = useListDepartments();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [profile, setProfile] = useState({ name: "", location: "", beds: 0, contactName: "", contactEmail: "" });
  const [thresholds, setThresholds] = useState({ reorderPct: 20, expiryWarningDays: 30, criticalStockPct: 10 });
  const [suppliers, setSuppliers] = useState(["MedPharm India", "Apollo Supply Co", "CureSupply"]);
  const [newSupplier, setNewSupplier] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (current) {
      setProfile({
        name: current.name,
        location: current.location,
        beds: current.beds,
        contactName: current.contactName ?? "",
        contactEmail: current.contactEmail ?? "",
      });
    }
  }, [current]);

  const handleSave = async () => {
    if (!current) return;
    setSaving(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/hospitals/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          location: profile.location,
          beds: profile.beds,
          contactName: profile.contactName || null,
          contactEmail: profile.contactEmail || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to save settings");
      }
      await queryClient.invalidateQueries();
      setSaved(true);
      toast({ title: "Settings saved", description: "Hospital profile updated successfully" });
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Could not update hospital settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: SPRING }}
      >
        <h1
          className="text-2xl font-extrabold tracking-tight"
          style={{
            background: "linear-gradient(135deg, #EDE6DC 0%, #C8922A 50%, #EDE6DC 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontFamily: "Barlow Condensed, sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          {current?.name ?? "Hospital"} Settings
        </h1>
        <p className="text-sm mt-0.5 text-muted-foreground">
          Configure thresholds, contact, and preferences for this workspace
        </p>
      </motion.div>

      {/* Workspace info banner */}
      {current && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: SPRING, delay: 0.05 }}
          className="flex items-center gap-4 px-4 py-3 rounded-xl"
          style={{
            background: "linear-gradient(90deg, rgba(200,146,42,0.08) 0%, transparent 100%)",
            border: "1px solid rgba(200,146,42,0.15)",
          }}
        >
          <Building2 className="w-5 h-5 shrink-0" style={{ color: "#C8922A" }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{current.name}</p>
            <div className="flex items-center gap-3 text-xs mt-0.5 text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{current.location}</span>
              <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{current.beds} beds</span>
            </div>
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(200,146,42,0.15)", color: "#E8B84B", border: "1px solid rgba(200,146,42,0.2)" }}
          >
            Active workspace
          </span>
        </motion.div>
      )}

      {/* Profile */}
      <GlassPanel delay={0.1}>
        <SectionHeader
          icon={<Building2 className="w-4 h-4" />}
          title="Hospital profile"
          subtitle="Basic information used across all reports and exports"
        />
        <div className="p-5 grid sm:grid-cols-2 gap-4">
          <Field label="Hospital name">
            <SettingsInput value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="e.g. City General Hospital" />
          </Field>
          <Field label="City / Location">
            <SettingsInput value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Mumbai, Maharashtra" />
          </Field>
          <Field label="Number of beds">
            <SettingsInput type="number" value={profile.beds || ""} onChange={e => setProfile(p => ({ ...p, beds: parseInt(e.target.value) || 0 }))} placeholder="e.g. 350" />
          </Field>
          <Field label="Contact person">
            <SettingsInput value={profile.contactName} onChange={e => setProfile(p => ({ ...p, contactName: e.target.value }))} placeholder="e.g. Dr. Ravi Gupta" />
          </Field>
          <Field label="Contact email">
            <SettingsInput type="email" value={profile.contactEmail} onChange={e => setProfile(p => ({ ...p, contactEmail: e.target.value }))} placeholder="procurement@hospital.com" />
          </Field>
        </div>
      </GlassPanel>

      {/* Alert Thresholds */}
      <GlassPanel delay={0.18}>
        <SectionHeader
          icon={<Bell className="w-4 h-4" />}
          title="Alert thresholds"
          subtitle="Configure when MedStock AI generates alerts and warnings"
        />
        <div className="p-5 space-y-5">
          <ThresholdSlider
            label="Reorder trigger — % of reorder point"
            value={thresholds.reorderPct} min={5} max={50} unit="%"
            onChange={v => setThresholds(t => ({ ...t, reorderPct: v }))}
          />
          <ThresholdSlider
            label="Expiry warning — days before expiry"
            value={thresholds.expiryWarningDays} min={7} max={90} unit="d"
            onChange={v => setThresholds(t => ({ ...t, expiryWarningDays: v }))}
          />
          <ThresholdSlider
            label="Critical stock — % of safety stock remaining"
            value={thresholds.criticalStockPct} min={2} max={25} unit="%"
            onChange={v => setThresholds(t => ({ ...t, criticalStockPct: v }))}
          />
          <div
            className="p-3 rounded-lg text-xs text-muted-foreground"
            style={{ background: "rgba(200,146,42,0.06)", border: "1px solid rgba(200,146,42,0.12)" }}
          >
            These thresholds apply only to the current hospital workspace. Changes take effect immediately on the dashboard.
          </div>
        </div>
      </GlassPanel>

      {/* Departments */}
      <GlassPanel delay={0.26}>
        <SectionHeader
          icon={<Package className="w-4 h-4" />}
          title="Departments"
          subtitle={`${departments?.length ?? 0} departments monitored in this workspace`}
        />
        <div className="p-5">
          <div className="space-y-2">
            {departments?.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.35 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/50 border border-border"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: "linear-gradient(135deg, #C8922A, #E8B84B)" }}
                />
                <span className="flex-1 text-sm font-medium text-foreground">{d.name}</span>
                {d.description && (
                  <span className="text-xs truncate max-w-[140px] text-muted-foreground">{d.description}</span>
                )}
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              </motion.div>
            ))}
            {!departments?.length && (
              <p className="text-sm text-center py-6 text-muted-foreground">No departments configured yet</p>
            )}
          </div>
        </div>
      </GlassPanel>

      {/* Preferred Suppliers */}
      <GlassPanel delay={0.34}>
        <SectionHeader
          icon={<Settings2 className="w-4 h-4" />}
          title="Preferred suppliers"
          subtitle="Suppliers prioritized in AI recommendations for this hospital"
        />
        <div className="p-5 space-y-3">
          <div className="space-y-2">
            {suppliers.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/50 border border-border"
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#C8922A" }} />
                <span className="flex-1 text-sm font-medium text-foreground">{s}</span>
                <button
                  onClick={() => setSuppliers(prev => prev.filter(x => x !== s))}
                  className="hover:text-destructive transition-colors text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded-lg text-sm text-foreground focus:outline-none transition-all duration-300 bg-muted border border-border"
              placeholder="Add supplier name…"
              value={newSupplier}
              onChange={e => setNewSupplier(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && newSupplier.trim()) {
                  setSuppliers(p => [...p, newSupplier.trim()]);
                  setNewSupplier("");
                }
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(200,146,42,0.4)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = ""; }}
            />
            <button
              onClick={() => { if (newSupplier.trim()) { setSuppliers(p => [...p, newSupplier.trim()]); setNewSupplier(""); } }}
              className="px-3 py-2 rounded-lg transition-all duration-300 hover:opacity-80"
              style={{ background: "rgba(200,146,42,0.15)", border: "1px solid rgba(200,146,42,0.25)", color: "#E8B84B" }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* Save button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.42 }}
        className="flex items-center justify-end gap-3 pb-4"
      >
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-green-500 font-medium"
          >
            ✓ Settings saved
          </motion.span>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !current}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, rgba(200,146,42,0.9), rgba(232,184,75,0.9))",
            color: "hsl(250,35%,4%)",
            boxShadow: "0 4px 20px rgba(200,146,42,0.3)",
          }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save settings"}
        </button>
      </motion.div>
    </div>
  );
}
