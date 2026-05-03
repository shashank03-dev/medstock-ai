import React from "react";
import { 
  useListExpiryItems, 
  useGetWastageReport,
  useGetRedistributionSuggestions,
  useMarkExpiryResolved,
  getListExpiryItemsQueryKey,
  getGetWastageReportQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, DollarSign, ArrowRightLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Expiry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: expiryItems, isLoading: loadingItems } = useListExpiryItems(
    { withinDays: 90 },
    { query: { queryKey: getListExpiryItemsQueryKey({ withinDays: 90 }) } }
  );
  
  const { data: report, isLoading: loadingReport } = useGetWastageReport({
    query: { queryKey: getGetWastageReportQueryKey() }
  });
  
  const { data: suggestions, isLoading: loadingSuggestions } = useGetRedistributionSuggestions();
  
  const markResolved = useMarkExpiryResolved();

  const handleResolve = (id: number, resolution: 'returned' | 'donated') => {
    markResolved.mutate(
      { data: { expiryItemId: id, resolution } },
      {
        onSuccess: () => {
          toast({ title: `Item marked as ${resolution}` });
          queryClient.invalidateQueries({ queryKey: getListExpiryItemsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetWastageReportQueryKey() });
        },
        onError: () => toast({ title: "Failed to update item", variant: "destructive" })
      }
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      case 'medium': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expiry & Wastage</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track expiring items and manage wastage reduction
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <AlertCircle className="w-4 h-4" />
              <h3 className="font-medium text-sm">Near Expiry Risk (90 Days)</h3>
            </div>
            {loadingReport ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-bold text-warning">${report?.nearExpiryRiskValue.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="w-4 h-4" />
              <h3 className="font-medium text-sm">Actual Wastage ({report?.month || 'This Month'})</h3>
            </div>
            {loadingReport ? <Skeleton className="h-8 w-24" /> : (
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-destructive">${report?.totalExpiredValue.toLocaleString()}</div>
                <span className={`text-xs font-medium ${report && report.changePercent > 0 ? 'text-destructive' : 'text-success'}`}>
                  {report && report.changePercent > 0 ? '+' : ''}{report?.changePercent}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary mb-2">
              <RefreshCw className="w-4 h-4" />
              <h3 className="font-medium text-sm">Potential Savings via Transfer</h3>
            </div>
            {loadingSuggestions ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-bold text-primary">
                ${suggestions?.reduce((acc, curr) => acc + curr.estimatedSaving, 0).toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {suggestions && suggestions.length > 0 && (
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              Redistribution Opportunities
            </CardTitle>
            <CardDescription>AI-suggested internal transfers to prevent expiry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/40 rounded-lg border border-border gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{s.skuName}</div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1 gap-2">
                      <Badge variant="secondary" className="font-normal text-xs">{s.fromDepartment}</Badge>
                      <ArrowRightLeft className="w-3 h-3" />
                      <Badge variant="secondary" className="font-normal text-xs">{s.toDepartment}</Badge>
                      <span className="ml-2">• {s.quantity} {s.unit}</span>
                      <span className="text-warning ml-2">• Expires in {s.daysUntilExpiry} days</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-success">Save ${s.estimatedSaving.toLocaleString()}</div>
                    </div>
                    <Button size="sm">Initiate Transfer</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Expiring Inventory (Next 90 Days)</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">SKU / Batch</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Expiry Date</th>
                <th className="px-4 py-3 font-medium text-right">Quantity</th>
                <th className="px-4 py-3 font-medium text-right">Est. Loss</th>
                <th className="px-4 py-3 font-medium text-center">Urgency</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingItems ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4"><Skeleton className="h-8 w-32" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-5 w-16 ml-auto" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-5 w-16 ml-auto" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-6 w-20 mx-auto" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : expiryItems?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No items expiring in the next 90 days.
                  </td>
                </tr>
              ) : (
                expiryItems?.map(item => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{item.skuName}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">Batch: {item.batchNumber}</div>
                    </td>
                    <td className="px-4 py-3">{item.departmentName}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{format(new Date(item.expiryDate), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-muted-foreground">{item.daysUntilExpiry} days left</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.quantity} <span className="text-xs text-muted-foreground">{item.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-destructive">
                      ${item.estimatedLoss.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={getUrgencyColor(item.urgency)}>
                        {item.urgency.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs"
                        onClick={() => handleResolve(item.id, 'returned')}
                        disabled={markResolved.isPending}
                      >
                        Return
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs"
                        onClick={() => handleResolve(item.id, 'donated')}
                        disabled={markResolved.isPending}
                      >
                        Donate
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
