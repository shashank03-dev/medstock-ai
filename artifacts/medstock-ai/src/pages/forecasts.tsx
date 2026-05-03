import React, { useState } from "react";
import { 
  useListForecasts, 
  useRunForecasts,
  useListDepartments,
  getListForecastsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrainCircuit, LineChart as ChartIcon, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Forecasts() {
  const [horizon, setHorizon] = useState<30 | 60 | 90>(30);
  const [dept, setDept] = useState<string>("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: departments } = useListDepartments();
  const forecastParams = { horizon, departmentId: dept !== "all" ? Number(dept) : undefined };
  const { data: forecasts, isLoading } = useListForecasts(forecastParams, {
    query: { queryKey: getListForecastsQueryKey(forecastParams) }
  });
  
  const runForecasts = useRunForecasts();

  const handleRunModel = () => {
    runForecasts.mutate(undefined, {
      onSuccess: (res) => {
        toast({ title: "Model Run Complete", description: `Processed ${res.skusProcessed} SKUs successfully.` });
        queryClient.invalidateQueries({ queryKey: getListForecastsQueryKey() });
      },
      onError: () => {
        toast({ title: "Model Run Failed", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Forecasting</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Demand predictions and confidence intervals
          </p>
        </div>
        <Button 
          onClick={handleRunModel} 
          disabled={runForecasts.isPending}
          className="bg-primary"
        >
          <BrainCircuit className="w-4 h-4 mr-2" />
          {runForecasts.isPending ? "Running Model..." : "Trigger AI Model Run"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex gap-4 items-center border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Horizon:</span>
            <Select value={horizon.toString()} onValueChange={(v) => setHorizon(Number(v) as 30 | 60 | 90)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Department:</span>
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map(d => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium text-right">Predicted Demand</th>
                <th className="px-4 py-3 font-medium text-center">Confidence Interval</th>
                <th className="px-4 py-3 font-medium">Projected Stockout</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-5 w-16 ml-auto" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24 mx-auto" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-5 w-16" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-8 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : forecasts?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <ChartIcon className="h-8 w-8 mb-2 opacity-20" />
                      <p>No forecasts available for this criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                forecasts?.map(f => (
                  <tr key={f.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex flex-col">
                        <span>{f.skuName}</span>
                        <span className="text-xs text-muted-foreground font-normal">Last run: {format(new Date(f.generatedAt), 'MMM d')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-lg font-bold">{f.isOverridden ? f.overrideValue : f.predictedQuantity}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <span>{f.confidenceLow}</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary/40 mx-auto" style={{ width: '60%' }}></div>
                        </div>
                        <span>{f.confidenceHigh}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {f.projectedStockoutDate ? (
                        <div className="flex items-center gap-1.5 text-destructive text-sm font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          {format(new Date(f.projectedStockoutDate), 'MMM d, yyyy')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Safe</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {f.isOverridden ? (
                        <Badge variant="secondary" className="bg-warning/20 text-warning hover:bg-warning/30">Manual Override</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">AI Generated</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm">Details</Button>
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
