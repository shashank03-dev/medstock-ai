import React, { useState } from "react";
import { Link, useRoute } from "wouter";
import {
  LayoutDashboard, PackageSearch, LineChart, ClockAlert, BellRing,
  Ambulance, ChevronLeft, Building2, UserPlus, ChevronDown, Check,
  Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useListHospitals } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Inventory", href: "/app/inventory", icon: PackageSearch },
  { name: "Forecasts", href: "/app/forecasts", icon: LineChart },
  { name: "Expiry & Wastage", href: "/app/expiry", icon: ClockAlert },
  { name: "Alerts", href: "/app/alerts", icon: BellRing },
  { name: "Crisis Network", href: "/app/crisis", icon: Ambulance },
];

const clientNav = [
  { name: "All Clients", href: "/app/clients", icon: Building2 },
  { name: "Onboard Client", href: "/app/onboarding", icon: UserPlus },
];

const settingsNav = [
  { name: "Hospital Settings", href: "/app/settings", icon: Settings2 },
];

async function switchHospital(id: number) {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  await fetch(`${base}/api/hospitals/${id}/set-current`, { method: "PUT" });
  window.location.reload();
}

function HospitalSwitcher() {
  const { data: hospitals, isLoading } = useListHospitals();
  const [open, setOpen] = useState(false);
  const current = hospitals?.find(h => h.isCurrentFacility);

  if (isLoading || !hospitals || hospitals.length <= 1) return null;

  return (
    <div className="px-3 pb-3 relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.04] hover:bg-white/[0.07] hover:border-[rgba(200,146,42,0.2)] transition-all duration-300 text-left group"
        style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.04)" }}
      >
        <Building2 className="w-3.5 h-3.5 text-[#C8922A]/60 shrink-0 group-hover:text-[#C8922A]/90 transition-colors" />
        <span className="flex-1 text-xs font-medium text-sidebar-foreground/70 truncate min-w-0 group-hover:text-sidebar-foreground transition-colors">
          {current?.name ?? "Select hospital"}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-sidebar-foreground/30 shrink-0 transition-transform duration-300", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="absolute left-3 right-3 top-full mt-1.5 z-50 rounded-xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(20,17,35,0.98) 0%, rgba(13,11,21,0.98) 100%)",
              border: "1px solid rgba(200,146,42,0.18)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,146,42,0.06)",
              backdropFilter: "blur(20px)",
            }}
          >
            {hospitals.map((h, i) => (
              <motion.button
                key={h.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                onClick={() => { setOpen(false); if (!h.isCurrentFacility) switchHospital(h.id); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-white/[0.04] transition-colors"
              >
                <Check className={cn("w-3.5 h-3.5 shrink-0 transition-opacity", h.isCurrentFacility ? "text-[#C8922A] opacity-100" : "opacity-0")} />
                <span className={cn("flex-1 truncate min-w-0 font-medium", h.isCurrentFacility ? "text-[#E8B84B]" : "text-sidebar-foreground/80")}>{h.name}</span>
                <span className="text-xs text-sidebar-foreground/30 shrink-0">{h.beds}b</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ item }: { item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> } }) {
  const [isActive] = useRoute(item.href === "/app" ? "/app" : item.href);
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
          isActive
            ? "nav-active-gold"
            : "text-sidebar-foreground/60 hover:bg-white/[0.04] hover:text-sidebar-foreground"
        )}
      >
        <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-[#C8922A]" : "")} />
        {item.name}
        {isActive && (
          <motion.span
            layoutId="nav-pill"
            className="absolute inset-0 rounded-lg"
            style={{ background: "linear-gradient(90deg, rgba(200,146,42,0.1) 0%, transparent 100%)" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          />
        )}
      </Link>
    </li>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "hsl(var(--background))" }}>
      {/* Sidebar — always dark regardless of theme */}
      <div
        className="w-64 flex flex-col flex-shrink-0 relative"
        style={{
          background: "linear-gradient(180deg, hsl(250,40%,3%) 0%, hsl(250,35%,4%) 100%)",
          borderRight: "1px solid rgba(200,146,42,0.08)",
        }}
      >
        {/* Subtle ambient glow top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(200,146,42,0.08) 0%, transparent 70%)", filter: "blur(20px)" }}
        />

        {/* Header */}
        <div
          className="h-14 flex items-center px-4 gap-2 shrink-0 relative"
          style={{ borderBottom: "1px solid rgba(200,146,42,0.08)" }}
        >
          <Link href="/" className="flex items-center gap-1.5 text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors text-xs">
            <ChevronLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <div style={{ width: 1, height: 16, background: "rgba(200,146,42,0.15)", margin: "0 4px" }} />
          <div className="font-bold text-sm text-sidebar-foreground flex items-center gap-1.5">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(200,146,42,0.25), rgba(200,146,42,0.1))", border: "1px solid rgba(200,146,42,0.25)" }}
            >
              <Ambulance className="w-3.5 h-3.5 text-[#C8922A]" />
            </div>
            <span>MedStock</span>
            <span className="text-gold-gradient font-extrabold">AI</span>
          </div>
        </div>

        {/* Hospital switcher */}
        <div className="pt-3">
          <HospitalSwitcher />
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto py-1 px-3">
          <ul className="space-y-0.5">
            {navigation.map((item) => <NavItem key={item.name} item={item} />)}
          </ul>

          {/* Clients section */}
          <div className="mt-5">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2"
              style={{ color: "rgba(200,146,42,0.4)" }}
            >
              Clients
            </p>
            <ul className="space-y-0.5">
              {clientNav.map((item) => <NavItem key={item.name} item={item} />)}
            </ul>
          </div>

          {/* Settings section */}
          <div className="mt-5">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2"
              style={{ color: "rgba(200,146,42,0.4)" }}
            >
              Config
            </p>
            <ul className="space-y-0.5">
              {settingsNav.map((item) => <NavItem key={item.name} item={item} />)}
            </ul>
          </div>
        </nav>

        {/* Footer with theme toggle */}
        <div
          className="p-4 shrink-0"
          style={{ borderTop: "1px solid rgba(200,146,42,0.08)" }}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full gold-pulse"
                style={{ background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }}
              />
              <span style={{ color: "rgba(237,230,220,0.5)" }}>System healthy</span>
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Global ambient orb — subtle in light mode via CSS */}
        <div
          className="ambient-orb absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(200,146,42,0.06) 0%, transparent 70%)",
            filter: "blur(60px)",
            transform: "translate(30%, -30%)",
          }}
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
