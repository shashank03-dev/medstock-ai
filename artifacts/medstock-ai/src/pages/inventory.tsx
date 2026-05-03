import React, { useState } from "react";
import { 
  useListInventory, 
  useListDepartments, 
  useUpdateStock,
  getListInventoryQueryKey,
  type InventoryItem
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Minus, ArrowRightLeft } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [updateType, setUpdateType] = useState<"receipt" | "consumption" | "adjustment">("receipt");
  const [updateQuantity, setUpdateQuantity] = useState<string>("");
  const [updateNotes, setUpdateNotes] = useState<string>("");

  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: inventory, isLoading } = useListInventory(undefined, {
    query: { queryKey: getListInventoryQueryKey() }
  });
  const { data: departments } = useListDepartments();
  const updateStock = useUpdateStock();

  const filtered = inventory?.filter(item => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.skuId.toString().includes(search)) return false;
    if (dept !== "all" && item.departmentId.toString() !== dept) return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    return true;
  });

  const handleUpdateStock = () => {
    if (!selectedItem || !updateQuantity || isNaN(Number(updateQuantity))) return;
    
    updateStock.mutate(
      { 
        data: {
          skuId: selectedItem.skuId,
          transactionType: updateType,
          quantity: Number(updateQuantity),
          notes: updateNotes || undefined
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Stock updated successfully" });
          queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() });
          setSelectedItem(null);
          setUpdateQuantity("");
          setUpdateNotes("");
        },
        onError: () => {
          toast({ title: "Failed to update stock", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage stock levels, SKUs, and reorder points
        </p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search SKUs or names..." 
              className="pl-9 bg-muted/50"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="w-[180px] bg-muted/50">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map(d => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-muted/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="adequate">Adequate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 font-medium">SKU / Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium text-right">Current Stock</th>
                <th className="px-4 py-3 font-medium text-right">Reorder Pt.</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-10 w-48" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-4 py-3 text-right"><Skeleton className="h-5 w-16 ml-auto" /></td>
                    <td className="px-4 py-3 text-right"><Skeleton className="h-5 w-16 ml-auto" /></td>
                    <td className="px-4 py-3 text-center"><Skeleton className="h-6 w-20 mx-auto" /></td>
                    <td className="px-4 py-3 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-8 w-8 mb-2 opacity-20" />
                      <p>No inventory items found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered?.map(item => (
                  <tr key={item.skuId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex flex-col">
                        <span className="truncate max-w-[250px]" title={item.name}>{item.name}</span>
                        <span className="text-xs text-muted-foreground font-normal font-mono">SKU: {item.skuId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                    <td className="px-4 py-3">{item.departmentName}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {item.currentStock} <span className="text-muted-foreground text-xs font-normal ml-1">{item.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {item.reorderPoint}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={
                        item.status === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        item.status === 'low' ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-success/10 text-success border-success/20'
                      }>
                        {item.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="secondary" size="sm" onClick={() => setSelectedItem(item)}>
                        Update Stock
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock Level</DialogTitle>
            <DialogDescription>
              Record a stock movement for {selectedItem?.name} (Current: {selectedItem?.currentStock} {selectedItem?.unit})
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-2">
              <Button 
                type="button" 
                variant={updateType === "receipt" ? "default" : "outline"} 
                className={updateType === "receipt" ? "bg-success hover:bg-success/90" : ""}
                onClick={() => setUpdateType("receipt")}
              >
                <Plus className="w-4 h-4 mr-2" /> Receipt
              </Button>
              <Button 
                type="button" 
                variant={updateType === "consumption" ? "default" : "outline"} 
                className={updateType === "consumption" ? "bg-warning hover:bg-warning/90" : ""}
                onClick={() => setUpdateType("consumption")}
              >
                <Minus className="w-4 h-4 mr-2" /> Usage
              </Button>
              <Button 
                type="button" 
                variant={updateType === "adjustment" ? "default" : "outline"} 
                onClick={() => setUpdateType("adjustment")}
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" /> Adjust
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity ({selectedItem?.unit})</Label>
              <Input 
                id="quantity" 
                type="number" 
                min="0"
                value={updateQuantity} 
                onChange={(e) => setUpdateQuantity(e.target.value)} 
                placeholder="Enter quantity..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input 
                id="notes" 
                value={updateNotes} 
                onChange={(e) => setUpdateNotes(e.target.value)} 
                placeholder="Reason for update..."
              />
            </div>
            
            {updateType === "adjustment" && (
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                Adjustment will set the total stock exactly to the quantity provided.
                If current stock is 10 and you adjust to 15, the new total is 15.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedItem(null)}>Cancel</Button>
            <Button onClick={handleUpdateStock} disabled={!updateQuantity || updateStock.isPending}>
              {updateStock.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
