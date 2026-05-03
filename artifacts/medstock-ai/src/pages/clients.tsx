import React, { useState } from "react";
import { useLocation } from "wouter";
import { useListHospitals } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, BedDouble, Phone, Mail, ArrowRight, Plus, Star, Settings, Users } from "lucide-react";

async function setCurrentHospital(id: number) {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  const res = await fetch(`${base}/api/hospitals/${id}/set-current`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to switch hospital");
  return res.json();
}

export default function Clients() {
  const [, navigate] = useLocation();
  const { data: hospitals, isLoading, refetch } = useListHospitals();
  const [switching, setSwitching] = useState<number | null>(null);

  const handleSetCurrent = async (id: number) => {
    setSwitching(id);
    try {
      await setCurrentHospital(id);
      await refetch();
    } catch {
      /* ignore */
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Hospitals</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage hospital clients and switch active workspace
          </p>
        </div>
        <button
          onClick={() => navigate("/app/onboarding")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Onboard New Client
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Clients", value: hospitals?.length ?? "—", icon: <Building2 className="w-4 h-4 text-muted-foreground" /> },
          { label: "Active Workspace", value: hospitals?.find((h) => h.isCurrentFacility)?.name ?? "None", icon: <Star className="w-4 h-4 text-amber-500" /> },
          { label: "Total Beds Managed", value: isLoading ? "—" : (hospitals?.reduce((s, h) => s + (h.beds ?? 0), 0) ?? 0).toLocaleString(), icon: <BedDouble className="w-4 h-4 text-muted-foreground" /> },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              {s.icon}
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-7 w-24" /> : (
                <div className="text-xl font-bold truncate">{s.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hospital list */}
      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))
        ) : hospitals?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <Building2 className="w-12 h-12 text-muted-foreground/40" />
              <div>
                <p className="font-semibold text-foreground">No clients yet</p>
                <p className="text-sm text-muted-foreground mt-1">Onboard your first hospital client to get started.</p>
              </div>
              <button
                onClick={() => navigate("/app/onboarding")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Onboard First Client
              </button>
            </CardContent>
          </Card>
        ) : (
          hospitals?.map((hospital) => (
            <Card key={hospital.id} className={hospital.isCurrentFacility ? "border-primary/40 bg-primary/5" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${hospital.isCurrentFacility ? "bg-primary/20" : "bg-muted"}`}>
                      <Building2 className={`w-5 h-5 ${hospital.isCurrentFacility ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{hospital.name}</h3>
                        {hospital.isCurrentFacility && (
                          <Badge className="text-xs bg-primary/20 text-primary border-primary/30 hover:bg-primary/20">Active workspace</Badge>
                        )}
                        {hospital.crisisMode && (
                          <Badge variant="destructive" className="text-xs">Crisis Mode</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />{hospital.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BedDouble className="w-3 h-3" />{hospital.beds} beds
                        </span>
                        {hospital.contactName && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />{hospital.contactName}
                          </span>
                        )}
                        {hospital.contactEmail && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />{hospital.contactEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!hospital.isCurrentFacility && (
                      <button
                        onClick={() => handleSetCurrent(hospital.id)}
                        disabled={switching === hospital.id}
                        className="text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        {switching === hospital.id ? "Switching…" : "Set Active"}
                      </button>
                    )}
                    <button
                      onClick={() => navigate("/app/inventory")}
                      className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Settings className="w-3 h-3" />
                      Manage
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* How customization works */}
      <Card className="bg-muted/30 border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            How client customization works
          </CardTitle>
          <CardDescription>
            Each hospital workspace is fully isolated with its own inventory catalog, departments, thresholds, and AI forecasts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: "01", title: "Onboard the client", body: "Run the onboarding wizard to set up their hospital profile, departments, and import their existing inventory SKUs." },
              { step: "02", title: "Set as active workspace", body: "Switch to that hospital's workspace using 'Set Active'. All dashboard data, alerts, and forecasts will reflect their inventory." },
              { step: "03", title: "Configure thresholds", body: "Inside Inventory, set custom reorder points and safety stock levels per SKU — tuned to their consumption patterns." },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <span className="text-sm font-bold text-muted-foreground/50 shrink-0 mt-0.5">{item.step}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/app/onboarding")}
            className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Start onboarding a new client <ArrowRight className="w-4 h-4" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
