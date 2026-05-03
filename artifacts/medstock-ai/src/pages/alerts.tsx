import React, { useState } from "react";
import { 
  useListAlerts, 
  useResolveAlert,
  getListAlertsQueryKey 
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Alerts() {
  const [severity, setSeverity] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: alerts, isLoading } = useListAlerts(undefined, {
    query: { queryKey: getListAlertsQueryKey() }
  });
  
  const resolveAlert = useResolveAlert();

  const handleResolve = (id: number) => {
    resolveAlert.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Alert resolved" });
        queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
      },
      onError: () => toast({ title: "Failed to resolve alert", variant: "destructive" })
    });
  };

  const filteredAlerts = alerts?.filter(a => {
    if (severity !== "all" && a.severity !== severity) return false;
    if (type !== "all" && a.type !== type) return false;
    return !a.isResolved;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Alerts</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review and resolve active supply chain issues
        </p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-4 items-center border-b">
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alert Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="expiry">Expiry</SelectItem>
              <SelectItem value="forecast">Forecast</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>

        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-6 flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))
          ) : filteredAlerts?.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <CheckCircle2 className="w-12 h-12 text-success mb-4 opacity-50" />
              <h3 className="text-lg font-medium">All clear</h3>
              <p className="text-muted-foreground">No active alerts matching your criteria.</p>
            </div>
          ) : (
            filteredAlerts?.map(alert => (
              <div key={alert.id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-muted/20 transition-colors">
                <div className={`p-3 rounded-full flex-shrink-0 ${
                  alert.severity === 'critical' ? 'bg-destructive/10 text-destructive' :
                  alert.severity === 'warning' ? 'bg-warning/10 text-warning' :
                  'bg-primary/10 text-primary'
                }`}>
                  {alert.severity === 'critical' ? <AlertCircle className="w-6 h-6" /> :
                   alert.severity === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
                   <Clock className="w-6 h-6" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base truncate">{alert.title}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(alert.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {alert.message}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize text-xs font-normal">
                      {alert.type.replace('_', ' ')}
                    </Badge>
                    {alert.skuName && (
                      <Badge variant="secondary" className="font-normal">
                        SKU: {alert.skuName}
                      </Badge>
                    )}
                    {alert.departmentName && (
                      <Badge variant="secondary" className="font-normal">
                        Dept: {alert.departmentName}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="sm:ml-auto mt-4 sm:mt-0 w-full sm:w-auto flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => handleResolve(alert.id)}
                    disabled={resolveAlert.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Resolved
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
