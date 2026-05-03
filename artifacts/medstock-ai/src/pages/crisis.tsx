import React, { useMemo, useState } from "react";
import {
  useListSurplusListings,
  useListCrisisRequests,
  useGetCrisisMatches,
  useGetCrisisMode,
  useToggleCrisisMode,
  useCreateSurplusListing,
  useCreateCrisisRequest,
  useUpdateCrisisRequestStatus,
  getGetCrisisModeQueryKey,
  getGetCrisisMatchesQueryKey,
  getListCrisisRequestsQueryKey,
  getListSurplusListingsQueryKey,
  type CreateSurplusListingBody,
  type CreateCrisisRequestBody,
  type SurplusListing,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ambulance,
  ShieldAlert,
  HeartPulse,
  Network,
  Plus,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

/* ─── CATEGORIES ─────────────────────────────────────────────────────────── */
const CATEGORIES = [
  "Opioids",
  "IV Fluids",
  "Anticoagulants",
  "Antibiotics",
  "Anaesthetics",
  "Vaccines",
  "Surgical Supplies",
  "PPE",
  "Diagnostics",
  "Other",
];

const UNITS = ["vials", "bags", "tablets", "capsules", "boxes", "units", "ml", "L", "kg"];

/* ─── POST SURPLUS LISTING DIALOG ──────────────────────────────────────────── */
function PostSurplusDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createSurplus = useCreateSurplusListing();

  const today = new Date().toISOString().split("T")[0];
  const thirtyDays = new Date(Date.now() + 30 * 86400_000).toISOString().split("T")[0];

  const [form, setForm] = useState<Partial<CreateSurplusListingBody>>({
    category: "Other",
    unit: "vials",
    validUntil: thirtyDays,
  });

  const set = (key: keyof CreateSurplusListingBody, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.skuName || !form.category || !form.quantity || !form.unit || !form.validUntil) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createSurplus.mutate(
      {
        data: {
          skuName: form.skuName!,
          category: form.category!,
          quantity: Number(form.quantity),
          unit: form.unit!,
          validUntil: form.validUntil!,
          expiryDate: form.expiryDate || undefined,
          pricePerUnit: form.pricePerUnit ? Number(form.pricePerUnit) : undefined,
          notes: form.notes || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Surplus listing posted to network" });
          queryClient.invalidateQueries({ queryKey: getListSurplusListingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCrisisMatchesQueryKey() });
          onClose();
          setForm({ category: "Other", unit: "vials", validUntil: thirtyDays });
        },
        onError: () => toast({ title: "Failed to post surplus listing", variant: "destructive" }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Post Surplus Listing</DialogTitle>
          <DialogDescription>
            Share excess inventory with the hospital network so others can request a transfer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="sl-sku">SKU / Item Name *</Label>
              <Input
                id="sl-sku"
                placeholder="e.g. Morphine Sulfate 10mg"
                value={form.skuName ?? ""}
                onChange={(e) => set("skuName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Unit *</Label>
              <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sl-qty">Quantity *</Label>
              <Input
                id="sl-qty"
                type="number"
                min={1}
                placeholder="0"
                value={form.quantity ?? ""}
                onChange={(e) => set("quantity", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sl-price">Price per Unit (₹)</Label>
              <Input
                id="sl-price"
                type="number"
                min={0}
                step={0.01}
                placeholder="Optional"
                value={form.pricePerUnit ?? ""}
                onChange={(e) => set("pricePerUnit", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sl-expiry">Expiry Date</Label>
              <Input
                id="sl-expiry"
                type="date"
                min={today}
                value={form.expiryDate ?? ""}
                onChange={(e) => set("expiryDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sl-valid">Available Until *</Label>
              <Input
                id="sl-valid"
                type="date"
                min={today}
                value={form.validUntil ?? ""}
                onChange={(e) => set("validUntil", e.target.value)}
                required
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="sl-notes">Notes</Label>
              <Textarea
                id="sl-notes"
                placeholder="Any additional information..."
                value={form.notes ?? ""}
                onChange={(e) => set("notes", e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createSurplus.isPending}>
              {createSurplus.isPending ? "Posting..." : "Post to Network"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── SUBMIT CRISIS REQUEST DIALOG ─────────────────────────────────────────── */
function SubmitRequestDialog({
  open,
  onClose,
  prefill,
}: {
  open: boolean;
  onClose: () => void;
  prefill?: { skuName?: string; unit?: string; category?: string };
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createRequest = useCreateCrisisRequest();

  const [form, setForm] = useState<Partial<CreateCrisisRequestBody>>({
    urgency: "critical",
    category: "Other",
    unit: "vials",
    isPriority: false,
    skuName: prefill?.skuName ?? "",
    ...prefill,
  });

  React.useEffect(() => {
    if (open) {
      setForm({
        urgency: "critical",
        category: prefill?.category ?? "Other",
        unit: prefill?.unit ?? "vials",
        isPriority: false,
        skuName: prefill?.skuName ?? "",
      });
    }
  }, [open, prefill?.skuName, prefill?.unit, prefill?.category]);

  const set = (key: keyof CreateCrisisRequestBody, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.skuName || !form.category || !form.quantityNeeded || !form.unit || !form.urgency) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createRequest.mutate(
      {
        data: {
          skuName: form.skuName!,
          category: form.category!,
          quantityNeeded: Number(form.quantityNeeded),
          unit: form.unit!,
          urgency: form.urgency as "critical" | "high" | "medium",
          notes: form.notes || undefined,
          isPriority: form.isPriority ?? false,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Crisis request submitted to network", variant: "default" });
          queryClient.invalidateQueries({ queryKey: getListCrisisRequestsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCrisisMatchesQueryKey() });
          onClose();
        },
        onError: () => toast({ title: "Failed to submit request", variant: "destructive" }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Crisis Request</DialogTitle>
          <DialogDescription>
            Alert the network about a critical shortage. AI will match you with available surplus.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="cr-sku">SKU / Item Name *</Label>
              <Input
                id="cr-sku"
                placeholder="e.g. Morphine Sulfate 10mg"
                value={form.skuName ?? ""}
                onChange={(e) => set("skuName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Urgency *</Label>
              <Select value={form.urgency} onValueChange={(v) => set("urgency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cr-qty">Quantity Needed *</Label>
              <Input
                id="cr-qty"
                type="number"
                min={1}
                placeholder="0"
                value={form.quantityNeeded ?? ""}
                onChange={(e) => set("quantityNeeded", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unit *</Label>
              <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="cr-notes">Notes</Label>
              <Textarea
                id="cr-notes"
                placeholder="Clinical urgency, patient count affected..."
                value={form.notes ?? ""}
                onChange={(e) => set("notes", e.target.value)}
                rows={2}
              />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <Switch
                id="cr-priority"
                checked={form.isPriority ?? false}
                onCheckedChange={(v) => set("isPriority", v)}
              />
              <Label htmlFor="cr-priority" className="cursor-pointer">
                Mark as Priority (life-critical, bumps queue)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={createRequest.isPending}>
              {createRequest.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── CONFIRM TRANSFER DIALOG ───────────────────────────────────────────────── */
function ConfirmTransferDialog({
  open,
  onClose,
  requestId,
  skuName,
  from,
  to,
  quantity,
  unit,
}: {
  open: boolean;
  onClose: () => void;
  requestId: number;
  skuName: string;
  from: string;
  to: string;
  quantity: number;
  unit: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateStatus = useUpdateCrisisRequestStatus();

  const handleConfirm = () => {
    updateStatus.mutate(
      { id: requestId, data: { status: "confirmed" } },
      {
        onSuccess: () => {
          toast({ title: "Transfer confirmed!", description: `${skuName} transfer from ${from} to ${to} is confirmed.` });
          queryClient.invalidateQueries({ queryKey: getListCrisisRequestsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCrisisMatchesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListSurplusListingsQueryKey() });
          onClose();
        },
        onError: () => toast({ title: "Failed to confirm transfer", variant: "destructive" }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Transfer</DialogTitle>
          <DialogDescription>
            This will mark the request as confirmed and notify both hospitals.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="text-sm font-semibold text-foreground">{skuName}</div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex-1 bg-muted/50 rounded p-2 text-center">
              <div className="text-xs text-muted-foreground mb-1">Supplying</div>
              <div className="font-medium">{from}</div>
            </div>
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 bg-muted/50 rounded p-2 text-center">
              <div className="text-xs text-muted-foreground mb-1">Receiving</div>
              <div className="font-medium">{to}</div>
            </div>
          </div>
          <div className="text-center text-sm font-medium text-primary">
            {quantity} {unit}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={updateStatus.isPending}>
            {updateStatus.isPending ? "Confirming..." : "Confirm Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── STATUS UPDATE ACTIONS ─────────────────────────────────────────────────── */
function RequestStatusActions({
  requestId,
  currentStatus,
}: {
  requestId: number;
  currentStatus: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateStatus = useUpdateCrisisRequestStatus();

  const update = (status: "confirmed" | "closed" | "transfer_acknowledged") => {
    updateStatus.mutate(
      { id: requestId, data: { status } },
      {
        onSuccess: () => {
          toast({ title: `Request marked as ${status.replace("_", " ")}` });
          queryClient.invalidateQueries({ queryKey: getListCrisisRequestsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCrisisMatchesQueryKey() });
        },
        onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
      }
    );
  };

  if (currentStatus === "closed" || currentStatus === "transfer_acknowledged") {
    return (
      <Badge variant="outline" className="text-success border-success/40 capitalize">
        {currentStatus.replace("_", " ")}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {currentStatus === "open" || currentStatus === "matched" ? (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={updateStatus.isPending}
          onClick={() => update("confirmed")}
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Confirm
        </Button>
      ) : null}
      {currentStatus === "confirmed" ? (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={updateStatus.isPending}
          onClick={() => update("transfer_acknowledged")}
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Acknowledge
        </Button>
      ) : null}
      {currentStatus !== "closed" && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-destructive hover:text-destructive"
          disabled={updateStatus.isPending}
          onClick={() => update("closed")}
        >
          <XCircle className="w-3 h-3 mr-1" />
          Close
        </Button>
      )}
    </div>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────────────────────────── */
export default function Crisis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showPostSurplus, setShowPostSurplus] = useState(false);
  const [showSubmitRequest, setShowSubmitRequest] = useState(false);
  const [requestPrefill, setRequestPrefill] = useState<{ skuName?: string; unit?: string; category?: string } | undefined>();
  const [confirmTransfer, setConfirmTransfer] = useState<{
    requestId: number; skuName: string; from: string; to: string; quantity: number; unit: string;
  } | null>(null);

  const { data: mode, isLoading: loadingMode } = useGetCrisisMode({
    query: { queryKey: getGetCrisisModeQueryKey() },
  });
  const { data: surplus, isLoading: loadingSurplus } = useListSurplusListings({
    query: { queryKey: getListSurplusListingsQueryKey() },
  });
  const { data: requests, isLoading: loadingRequests } = useListCrisisRequests({
    query: { queryKey: getListCrisisRequestsQueryKey() },
  });
  const { data: matches, isLoading: loadingMatches } = useGetCrisisMatches({
    query: { queryKey: getGetCrisisMatchesQueryKey() },
  });
  const toggleCrisis = useToggleCrisisMode();

  const sortedRequests = useMemo(
    () => [...(requests ?? [])].sort((a, b) => Number(b.isPriority) - Number(a.isPriority)),
    [requests]
  );
  const filteredSurplus = useMemo(
    () => (surplus ?? []).filter((item) => item.status === "available"),
    [surplus]
  );
  const openRequests = useMemo(
    () => (requests ?? []).filter((r) => r.status === "open"),
    [requests]
  );

  const handleToggleMode = () => {
    if (!mode) return;
    toggleCrisis.mutate(
      { data: { active: !mode.active, reason: !mode.active ? "Network-wide shortage declared" : undefined } },
      {
        onSuccess: () => {
          toast({
            title: !mode.active ? "CRISIS MODE ACTIVATED" : "Crisis Mode Deactivated",
            variant: !mode.active ? "destructive" : "default",
          });
          queryClient.invalidateQueries({ queryKey: getGetCrisisModeQueryKey() });
        },
      }
    );
  };

  const openRequestTransfer = (item: SurplusListing) => {
    setRequestPrefill({ skuName: item.skuName, unit: item.unit, category: item.category });
    setShowSubmitRequest(true);
  };

  const STATUS_COLOR: Record<string, string> = {
    open: "text-warning border-warning/40",
    matched: "text-primary border-primary/40",
    confirmed: "text-success border-success/40",
    transfer_acknowledged: "text-success border-success/40",
    closed: "text-muted-foreground border-border",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crisis Coordination</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Network surplus listings and critical shortage requests
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => { setRequestPrefill(undefined); setShowSubmitRequest(true); }}>
            <Plus className="w-4 h-4 mr-1.5" />
            Submit Request
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPostSurplus(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Post Surplus
          </Button>
          {loadingMode ? (
            <Skeleton className="h-9 w-36" />
          ) : (
            <Button
              variant={mode?.active ? "destructive" : "outline"}
              className={mode?.active ? "animate-pulse" : "border-destructive text-destructive hover:bg-destructive hover:text-white"}
              onClick={handleToggleMode}
              disabled={toggleCrisis.isPending}
            >
              <ShieldAlert className="w-4 h-4 mr-2" />
              {mode?.active ? "DISABLE CRISIS MODE" : "ACTIVATE CRISIS MODE"}
            </Button>
          )}
        </div>
      </div>

      {/* Crisis Mode Banner */}
      {mode?.active && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-destructive">Network Crisis Mode is Active</h3>
            <p className="text-sm text-destructive/80 mt-1">
              Prioritized routing enabled. All surplus listings are now instantly visible network-wide.
              Activated on{" "}
              {mode.activatedAt ? format(new Date(mode.activatedAt), "MMM d, HH:mm") : "Unknown"}.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Open Requests"
          value={openRequests.length}
          icon={<Ambulance className="w-4 h-4 text-warning" />}
          loading={loadingRequests}
        />
        <MetricCard
          title="Available Surplus"
          value={filteredSurplus.length}
          icon={<HeartPulse className="w-4 h-4 text-success" />}
          loading={loadingSurplus}
        />
        <MetricCard
          title="AI Matches Found"
          value={matches?.length || 0}
          icon={<Network className="w-4 h-4 text-primary" />}
          loading={loadingMatches}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="matches">
            AI Matches{matches && matches.length > 0 ? ` (${matches.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="requests">
            Critical Requests{requests && requests.length > 0 ? ` (${requests.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="surplus">
            Network Surplus{filteredSurplus.length > 0 ? ` (${filteredSurplus.length})` : ""}
          </TabsTrigger>
        </TabsList>

        {/* AI Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          {loadingMatches ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
          ) : !matches || matches.length === 0 ? (
            <Card>
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <Network className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">No active matches yet</p>
                <p className="text-sm mt-1">Submit a crisis request or post surplus to trigger AI matching.</p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => { setRequestPrefill(undefined); setShowSubmitRequest(true); }}>
                    Submit Request
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowPostSurplus(true)}>
                    Post Surplus
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            matches.map((match, i) => (
              <Card key={i} className="border-primary/30 shadow-sm overflow-hidden">
                <div className="bg-primary/5 p-3 px-6 border-b border-primary/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary text-primary-foreground">
                      {Math.round(match.matchScore * 100)}% Match
                    </Badge>
                    <span className="text-sm font-semibold">{match.skuName}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={match.urgency === "critical" ? "text-destructive border-destructive/30" : "text-warning border-warning/30"}
                  >
                    {match.urgency.toUpperCase()}
                  </Badge>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row items-stretch justify-between gap-6">
                    <div className="flex-1 text-center md:text-left bg-muted/30 p-4 rounded-lg border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Requesting</div>
                      <div className="font-semibold text-lg">{match.requestingHospital}</div>
                      <div className="text-sm mt-2 font-medium text-destructive">
                        Needs: {match.quantityNeeded} {match.unit}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center px-4 gap-3">
                      <ArrowLeftRight className="w-6 h-6 text-muted-foreground" />
                      <Button
                        size="sm"
                        onClick={() =>
                          setConfirmTransfer({
                            requestId: match.requestId,
                            skuName: match.skuName,
                            from: match.supplyingHospital,
                            to: match.requestingHospital,
                            quantity: match.quantityNeeded,
                            unit: match.unit,
                          })
                        }
                      >
                        Confirm Transfer
                      </Button>
                    </div>

                    <div className="flex-1 text-center md:text-right bg-muted/30 p-4 rounded-lg border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Supplying</div>
                      <div className="font-semibold text-lg">{match.supplyingHospital}</div>
                      <div className="text-sm mt-2 font-medium text-success">
                        Has: {match.quantityAvailable} {match.unit}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Critical Requests Tab */}
        <TabsContent value="requests">
          <div className="flex justify-end mb-3">
            <Button size="sm" variant="outline" onClick={() => { setRequestPrefill(undefined); setShowSubmitRequest(true); }}>
              <Plus className="w-4 h-4 mr-1.5" />
              Submit New Request
            </Button>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Hospital</th>
                    <th className="px-4 py-3 font-medium">SKU Requested</th>
                    <th className="px-4 py-3 font-medium text-right">Quantity</th>
                    <th className="px-4 py-3 font-medium text-center">Urgency</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingRequests ? (
                    <tr>
                      <td colSpan={6} className="p-4">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ) : sortedRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-muted-foreground">
                        No crisis requests yet.{" "}
                        <button
                          className="underline text-primary"
                          onClick={() => { setRequestPrefill(undefined); setShowSubmitRequest(true); }}
                        >
                          Submit one
                        </button>
                      </td>
                    </tr>
                  ) : (
                    sortedRequests.map((req) => (
                      <tr key={req.id} className={`hover:bg-muted/20 ${req.isPriority ? "bg-destructive/3" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="font-medium flex items-center gap-1.5">
                            {req.isPriority && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive" />
                            )}
                            {req.hospitalName}
                          </div>
                          <div className="text-xs text-muted-foreground">{req.hospitalLocation}</div>
                        </td>
                        <td className="px-4 py-3 font-medium">{req.skuName}</td>
                        <td className="px-4 py-3 text-right">
                          {req.quantityNeeded}{" "}
                          <span className="text-xs text-muted-foreground">{req.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant="outline"
                            className={req.urgency === "critical" ? "text-destructive border-destructive/50" : req.urgency === "high" ? "text-warning border-warning/40" : ""}
                          >
                            {req.urgency.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`capitalize ${STATUS_COLOR[req.status] ?? ""}`}>
                            {req.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <RequestStatusActions requestId={req.id} currentStatus={req.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Network Surplus Tab */}
        <TabsContent value="surplus">
          <div className="flex justify-end mb-3">
            <Button size="sm" variant="outline" onClick={() => setShowPostSurplus(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Post Surplus Listing
            </Button>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Hospital</th>
                    <th className="px-4 py-3 font-medium">Available SKU</th>
                    <th className="px-4 py-3 font-medium text-right">Qty</th>
                    <th className="px-4 py-3 font-medium">Price/Unit</th>
                    <th className="px-4 py-3 font-medium">Valid Until</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingSurplus ? (
                    <tr>
                      <td colSpan={6} className="p-4">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ) : filteredSurplus.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-muted-foreground">
                        No surplus listings available.{" "}
                        <button
                          className="underline text-primary"
                          onClick={() => setShowPostSurplus(true)}
                        >
                          Post one
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredSurplus.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.hospitalName}</div>
                          <div className="text-xs text-muted-foreground">{item.hospitalLocation}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.skuName}</div>
                          {item.notes && (
                            <div className="text-xs text-muted-foreground mt-0.5">{item.notes}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.quantity}{" "}
                          <span className="text-xs text-muted-foreground">{item.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.pricePerUnit != null ? `₹${item.pricePerUnit}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(new Date(item.validUntil), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => openRequestTransfer(item)}
                          >
                            Request Transfer
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PostSurplusDialog open={showPostSurplus} onClose={() => setShowPostSurplus(false)} />
      <SubmitRequestDialog
        open={showSubmitRequest}
        onClose={() => { setShowSubmitRequest(false); setRequestPrefill(undefined); }}
        prefill={requestPrefill}
      />
      {confirmTransfer && (
        <ConfirmTransferDialog
          open={true}
          onClose={() => setConfirmTransfer(null)}
          {...confirmTransfer}
        />
      )}
    </div>
  );
}

/* ─── METRIC CARD ───────────────────────────────────────────────────────────── */
function MetricCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <Card>
      <div className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-3xl font-bold">{value}</div>
          )}
        </div>
        <div className="p-3 bg-muted/50 rounded-full">{icon}</div>
      </div>
    </Card>
  );
}
