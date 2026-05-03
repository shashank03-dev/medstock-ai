import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Layers, Package, CheckCircle2, Plus, X, ChevronRight,
  ChevronLeft, Loader2, BedDouble, MapPin, Mail, User, Stethoscope,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Dept { name: string; description?: string }
interface SkuRow {
  name: string; category: string; unit: string; unitCost: number;
  supplier: string; departmentIndex: number; currentStock: number;
  reorderPoint: number; safetyStock: number;
}

// ── Common templates from the skill (time-to-value: pre-fill common choices) ──
const DEPT_TEMPLATES = ["ICU", "Pharmacy", "Operating Theatre", "Emergency", "General Ward", "Radiology", "Pathology", "Paediatrics"];

const SKU_TEMPLATES: Omit<SkuRow, "departmentIndex">[] = [
  { name: "Amoxicillin 500mg", category: "Antibiotics", unit: "Strip", unitCost: 45, supplier: "Sun Pharma", currentStock: 200, reorderPoint: 50, safetyStock: 30 },
  { name: "Paracetamol 500mg", category: "Analgesics", unit: "Strip", unitCost: 18, supplier: "Cipla", currentStock: 500, reorderPoint: 100, safetyStock: 60 },
  { name: "Normal Saline 500ml", category: "IV Fluids", unit: "Bottle", unitCost: 35, supplier: "Baxter", currentStock: 150, reorderPoint: 40, safetyStock: 25 },
  { name: "Surgical Gloves L", category: "Consumables", unit: "Pair", unitCost: 12, supplier: "Ansell", currentStock: 800, reorderPoint: 200, safetyStock: 100 },
  { name: "Insulin Glargine 100U", category: "Injectables", unit: "Vial", unitCost: 420, supplier: "Novo Nordisk", currentStock: 60, reorderPoint: 15, safetyStock: 10 },
  { name: "Morphine Sulfate 10mg", category: "Controlled", unit: "Vial", unitCost: 280, supplier: "Neon Labs", currentStock: 30, reorderPoint: 8, safetyStock: 5 },
];

const STEP_META = [
  { icon: Building2, label: "Hospital profile" },
  { icon: Layers, label: "Departments" },
  { icon: Package, label: "Inventory" },
  { icon: CheckCircle2, label: "Done" },
];

// ── Input component ───────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground block mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
    />
  );
}

// ── Step 1: Hospital Profile ───────────────────────────────────────────────────
function StepHospital({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Hospital profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Basic information about the client hospital you are onboarding.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Hospital name" required>
          <Input placeholder="e.g. City General Hospital" value={data.name} onChange={e => onChange({ ...data, name: e.target.value })} />
        </Field>
        <Field label="City / Location" required>
          <Input placeholder="e.g. Mumbai, Maharashtra" value={data.location} onChange={e => onChange({ ...data, location: e.target.value })} />
        </Field>
        <Field label="Number of beds" required>
          <Input type="number" min={1} placeholder="e.g. 350" value={data.beds || ""} onChange={e => onChange({ ...data, beds: parseInt(e.target.value) || 0 })} />
        </Field>
        <Field label="Specialization">
          <Input placeholder="e.g. Multi-specialty, Cardiac, Oncology" value={data.specialization} onChange={e => onChange({ ...data, specialization: e.target.value })} />
        </Field>
        <Field label="Contact person name">
          <Input placeholder="e.g. Dr. Ravi Gupta" value={data.contactName} onChange={e => onChange({ ...data, contactName: e.target.value })} />
        </Field>
        <Field label="Contact email">
          <Input type="email" placeholder="procurement@hospital.com" value={data.contactEmail} onChange={e => onChange({ ...data, contactEmail: e.target.value })} />
        </Field>
      </div>
      <div className="p-3 rounded-lg bg-muted/40 border border-dashed text-sm text-muted-foreground">
        <strong className="text-foreground">What happens next:</strong> We'll create a dedicated workspace for this hospital, fully isolated from other clients. All inventory, alerts, and forecasts will be specific to them.
      </div>
    </div>
  );
}

// ── Step 2: Departments ────────────────────────────────────────────────────────
function StepDepartments({ departments, onChange }: { departments: Dept[]; onChange: (d: Dept[]) => void }) {
  const [custom, setCustom] = useState("");
  const add = (name: string) => {
    if (!name.trim() || departments.some(d => d.name.toLowerCase() === name.toLowerCase())) return;
    onChange([...departments, { name: name.trim() }]);
    setCustom("");
  };
  const remove = (i: number) => onChange(departments.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Departments</h2>
        <p className="text-sm text-muted-foreground mt-1">Which departments will MedStock AI monitor? Click to add common ones or type a custom name.</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Common departments</p>
        <div className="flex flex-wrap gap-2">
          {DEPT_TEMPLATES.map(name => {
            const added = departments.some(d => d.name === name);
            return (
              <button
                key={name}
                onClick={() => added ? remove(departments.findIndex(d => d.name === name)) : add(name)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-colors font-medium ${added ? "bg-primary/20 border-primary/40 text-primary" : "bg-background border-border text-foreground hover:bg-muted"}`}
              >
                {added ? "✓ " : ""}{name}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Add custom department</p>
        <div className="flex gap-2">
          <Input placeholder="e.g. Neurology, Dermatology…" value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => e.key === "Enter" && add(custom)} />
          <button onClick={() => add(custom)} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      {departments.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Selected ({departments.length})</p>
          <div className="flex flex-wrap gap-2">
            {departments.map((d, i) => (
              <Badge key={i} variant="secondary" className="gap-1.5 pr-1.5 text-sm">
                {d.name}
                <button onClick={() => remove(i)} className="hover:text-foreground text-muted-foreground"><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
        </div>
      )}
      {departments.length === 0 && (
        <p className="text-sm text-red-400">Please add at least one department to continue.</p>
      )}
    </div>
  );
}

// ── Step 3: Inventory ──────────────────────────────────────────────────────────
function StepInventory({ skus, departments, onChange }: { skus: SkuRow[]; departments: Dept[]; onChange: (s: SkuRow[]) => void }) {
  const addTemplate = (tpl: Omit<SkuRow, "departmentIndex">) => {
    if (skus.some(s => s.name === tpl.name)) return;
    onChange([...skus, { ...tpl, departmentIndex: 0 }]);
  };
  const remove = (i: number) => onChange(skus.filter((_, idx) => idx !== i));
  const update = <K extends keyof SkuRow>(i: number, field: K, value: SkuRow[K]) => {
    const next = [...skus];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const addBlank = () => onChange([...skus, { name: "", category: "Medicines", unit: "Strip", unitCost: 0, supplier: "", departmentIndex: 0, currentStock: 0, reorderPoint: 0, safetyStock: 0 }]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Inventory items</h2>
        <p className="text-sm text-muted-foreground mt-1">Add the hospital's initial SKU catalog. You can always add more later from the Inventory page.</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Quick add common items</p>
        <div className="flex flex-wrap gap-2">
          {SKU_TEMPLATES.map(t => {
            const added = skus.some(s => s.name === t.name);
            return (
              <button key={t.name} onClick={() => addTemplate(t)} disabled={added}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${added ? "bg-primary/20 border-primary/40 text-primary opacity-60" : "bg-background border-border text-foreground hover:bg-muted"}`}>
                {added ? "✓ " : "+"}{t.name}
              </button>
            );
          })}
        </div>
      </div>
      {skus.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Added items ({skus.length})</p>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid text-xs font-semibold text-muted-foreground bg-muted/50 px-4 py-2" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 0.5fr" }}>
              <span>Name</span><span>Category</span><span>Department</span><span>Reorder at</span><span></span>
            </div>
            {skus.map((sku, i) => (
              <div key={i} className="grid items-center px-4 py-2 border-t border-border gap-2 text-sm" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 0.5fr" }}>
                <input className="bg-transparent border-b border-transparent focus:border-primary/50 outline-none text-sm text-foreground" value={sku.name} onChange={e => update(i, "name", e.target.value)} placeholder="SKU name" />
                <input className="bg-transparent border-b border-transparent focus:border-primary/50 outline-none text-sm text-muted-foreground" value={sku.category} onChange={e => update(i, "category", e.target.value)} />
                <select className="bg-background border border-border rounded text-xs px-1 py-0.5" value={sku.departmentIndex} onChange={e => update(i, "departmentIndex", parseInt(e.target.value))}>
                  {departments.map((d, di) => <option key={di} value={di}>{d.name}</option>)}
                </select>
                <input type="number" className="bg-transparent border-b border-transparent focus:border-primary/50 outline-none text-sm text-muted-foreground w-16" value={sku.reorderPoint} onChange={e => update(i, "reorderPoint", parseFloat(e.target.value) || 0)} />
                <button onClick={() => remove(i)} className="text-muted-foreground hover:text-red-400 transition-colors justify-self-end"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
      <button onClick={addBlank} className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
        <Plus className="w-4 h-4" />Add custom SKU
      </button>
      <p className="text-xs text-muted-foreground">Tip: You can skip this step and bulk-import inventory later from the Inventory page.</p>
    </div>
  );
}

// ── Step 4: Success ───────────────────────────────────────────────────────────
function StepSuccess({ hospitalName, counts }: { hospitalName: string; counts: { departments: number; skus: number } }) {
  const [, navigate] = useLocation();
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
        <div className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
      </motion.div>
      <div>
        <h2 className="text-2xl font-bold text-foreground">{hospitalName} is live!</h2>
        <p className="text-muted-foreground mt-2 text-sm">The workspace is set up and ready. MedStock AI is now monitoring this hospital's supply chain.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {[
          { label: "Departments", value: counts.departments },
          { label: "SKUs imported", value: counts.skus },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl bg-muted/50 border">
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={() => navigate("/app")} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
          Open dashboard →
        </button>
        <button onClick={() => navigate("/app/clients")} className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
          View all clients
        </button>
      </div>
      <div className="p-4 rounded-xl bg-muted/30 border border-dashed text-left max-w-md mx-auto space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What to do next</p>
        {[
          "Set custom reorder points per SKU in Inventory",
          "Run AI forecast to generate 30/60/90-day predictions",
          "Configure expiry alerts for critical batches",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="text-primary font-bold shrink-0">{i + 1}.</span>{item}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Onboarding Page ───────────────────────────────────────────────────────
export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ hospitalName: string; counts: { departments: number; skus: number } } | null>(null);

  const [hospital, setHospital] = useState({ name: "", location: "", beds: 0, contactName: "", contactEmail: "", specialization: "" });
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [skus, setSkus] = useState<SkuRow[]>([]);

  const canNext = [
    hospital.name.trim().length > 0 && hospital.location.trim().length > 0 && hospital.beds > 0,
    departments.length > 0,
    true,
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospital, departments, skus, setAsCurrent: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Onboarding failed");
      setSuccessData({ hospitalName: data.hospitalName, counts: { departments: data.departmentsCreated, skus: data.skusCreated } });
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    <StepHospital data={hospital} onChange={setHospital} />,
    <StepDepartments departments={departments} onChange={setDepartments} />,
    <StepInventory skus={skus} departments={departments} onChange={setSkus} />,
    successData ? <StepSuccess hospitalName={successData.hospitalName} counts={successData.counts} /> : null,
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/app/clients")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Onboard new client</h1>
          <p className="text-sm text-muted-foreground">Set up a new hospital workspace in 3 steps</p>
        </div>
      </div>

      {/* Progress steps */}
      {step < 3 && (
        <div className="flex items-center gap-0">
          {STEP_META.slice(0, 3).map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${i === step ? "text-foreground" : i < step ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="hidden sm:block">{s.label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-px mx-2 transition-colors ${i < step ? "bg-primary/40" : "bg-border"}`} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
      )}

      {/* Navigation */}
      {step < 3 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate("/app/clients")}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />{step === 0 ? "Cancel" : "Back"}
          </button>

          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => setStep(step - 1)} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
            )}
            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext[step]}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Setting up…</> : <>Complete setup <CheckCircle2 className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
