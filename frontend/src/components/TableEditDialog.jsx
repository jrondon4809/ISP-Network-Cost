import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const TableEditDialog = ({ table, onSave, onClose, nodes, edges }) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (table?.data?.rows) {
      setRows(table.data.rows);
    }
  }, [table]);

  // Auto-calculate PR Cost whenever dialog opens or dependencies change
  useEffect(() => {
    if (!table || !nodes || !edges) return;

    // Find edges connected to this table
    const connectedEdges = edges.filter(edge => edge.target === table.id);
    
    if (connectedEdges.length === 0) {
      return; // No connections, can't calculate
    }

    // Use the first connected edge
    const edge = connectedEdges[0];
    const sourceNode = nodes.find(n => n.id === edge.source);
    
    if (!sourceNode || sourceNode.type !== 'networkNode') {
      return;
    }

    // Calculate node total cost
    const rent = parseFloat(sourceNode.data.rent) || 0;
    const carryInRent = parseFloat(sourceNode.data.carryInRent) || 0;
    const nodeTotalCost = rent + carryInRent;

    // Find ALL outgoing edges from the source node
    const outgoingEdges = edges.filter(e => e.source === sourceNode.id);
    
    // Calculate total sum of all outgoing link bandwidths
    let totalOutgoingBandwidth = 0;
    outgoingEdges.forEach(outEdge => {
      const bandwidthStr = outEdge.data?.bandwidth || '100 Mbps';
      const bandwidthMatch = bandwidthStr.match(/(\d+(?:\.\d+)?)/);
      const bandwidth = bandwidthMatch ? parseFloat(bandwidthMatch[1]) : 100;
      totalOutgoingBandwidth += bandwidth;
    });

    if (totalOutgoingBandwidth === 0) {
      return;
    }

    // Get bandwidth of the link connecting to this table
    const linkBandwidthStr = edge.data?.bandwidth || '100 Mbps';
    const linkBandwidthMatch = linkBandwidthStr.match(/(\d+(?:\.\d+)?)/);
    const linkBandwidth = linkBandwidthMatch ? parseFloat(linkBandwidthMatch[1]) : 100;

    // Calculate total sum of BW column in the table
    let totalTableBandwidth = 0;
    rows.forEach(row => {
      const rowBwStr = row.bw || '0';
      const rowBwMatch = rowBwStr.match(/(\d+(?:\.\d+)?)/);
      const rowBandwidth = rowBwMatch ? parseFloat(rowBwMatch[1]) : 0;
      totalTableBandwidth += rowBandwidth;
    });

    if (totalTableBandwidth === 0) {
      return; // No bandwidth in table to calculate against
    }

    // Calculate PR Cost for each row automatically
    // Formula: (Node Total Cost ÷ Total Outgoing BW) × Link BW ÷ Total Table BW
    const costPerUnit = (nodeTotalCost / totalOutgoingBandwidth) * linkBandwidth / totalTableBandwidth;

    setRows(currentRows => {
      return currentRows.map(row => {
        // Get row bandwidth
        const rowBwStr = row.bw || '0';
        const rowBwMatch = rowBwStr.match(/(\d+(?:\.\d+)?)/);
        const rowBandwidth = rowBwMatch ? parseFloat(rowBwMatch[1]) : 0;

        if (rowBandwidth === 0) {
          return {
            ...row,
            prCost: '$0.00'
          };
        }

        // PR Cost = costPerUnit × Row BW
        const prCost = costPerUnit * rowBandwidth;
        
        return {
          ...row,
          prCost: '$' + prCost.toFixed(2)
        };
      });
    });
  }, [table, nodes, edges, rows]); // Auto-recalculate when any of these change

  const addRow = () => {
    const newRow = {
      id: Date.now(),
      client: '',
      service: '',
      bw: '',
      prCost: '$0.00',
      intCost: '',
      transpCost: '',
      totalCost: '',
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const updateRow = (id, field, value) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ rows });
  };

  // Get connection info for display
  const getConnectionInfo = () => {
    if (!table || !nodes || !edges) return null;
    
    const connectedEdge = edges.find(edge => edge.target === table.id);
    if (!connectedEdge) return null;
    
    const sourceNode = nodes.find(n => n.id === connectedEdge.source);
    if (!sourceNode || sourceNode.type !== 'networkNode') return null;
    
    const rent = parseFloat(sourceNode.data.rent) || 0;
    const carryInRent = parseFloat(sourceNode.data.carryInRent) || 0;
    const nodeTotalCost = rent + carryInRent;
    
    // Calculate total sum of all outgoing link bandwidths from source node
    const outgoingEdges = edges.filter(e => e.source === sourceNode.id);
    let totalOutgoingBandwidth = 0;
    outgoingEdges.forEach(outEdge => {
      const bandwidthStr = outEdge.data?.bandwidth || '100 Mbps';
      const bandwidthMatch = bandwidthStr.match(/(\d+(?:\.\d+)?)/);
      const bandwidth = bandwidthMatch ? parseFloat(bandwidthMatch[1]) : 100;
      totalOutgoingBandwidth += bandwidth;
    });

    // Get link bandwidth
    const linkBandwidthStr = connectedEdge.data?.bandwidth || '100 Mbps';
    const linkBandwidthMatch = linkBandwidthStr.match(/(\d+(?:\.\d+)?)/);
    const linkBandwidth = linkBandwidthMatch ? parseFloat(linkBandwidthMatch[1]) : 100;

    // Calculate total table bandwidth
    let totalTableBandwidth = 0;
    rows.forEach(row => {
      const rowBwStr = row.bw || '0';
      const rowBwMatch = rowBwStr.match(/(\d+(?:\.\d+)?)/);
      const rowBandwidth = rowBwMatch ? parseFloat(rowBwMatch[1]) : 0;
      totalTableBandwidth += rowBandwidth;
    });
    
    return {
      nodeName: sourceNode.data.name,
      nodeTotalCost,
      totalOutgoingBandwidth: `${totalOutgoingBandwidth} Mbps (sum of ${outgoingEdges.length} outgoing links)`,
      linkBandwidth: `${linkBandwidth} Mbps`,
      totalTableBandwidth: `${totalTableBandwidth} Mbps`,
      outgoingLinksCount: outgoingEdges.length
    };
  };

  const connectionInfo = getConnectionInfo();

  return (
    <Dialog open={!!table} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>
              Manage table rows and data below. PR Cost is auto-calculated from connected node.
            </DialogDescription>
          </DialogHeader>
          {connectionInfo && (
            <div className="my-3 p-3 bg-primary/5 rounded-lg border border-primary/20 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Auto-Calculation Active</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                <div>
                  <span className="font-medium">Connected Node:</span> {connectionInfo.nodeName}
                </div>
                <div>
                  <span className="font-medium">Node Total Cost:</span> ${connectionInfo.nodeTotalCost.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Total Outgoing BW:</span> {connectionInfo.totalOutgoingBandwidth}
                </div>
                <div>
                  <span className="font-medium">This Link BW:</span> {connectionInfo.linkBandwidth}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Table Total BW:</span> {connectionInfo.totalTableBandwidth}
                </div>
              </div>
              <div className="mt-2 p-2 bg-background/50 rounded text-xs">
                <p className="font-medium text-foreground mb-1">Formula:</p>
                <p className="text-muted-foreground">
                  PR Cost = (Node Total Cost ÷ Total Outgoing BW) × Link BW ÷ Total Table BW
                </p>
              </div>
            </div>
          )}
          {!connectionInfo && (
            <div className="my-3 p-3 bg-muted/50 rounded-lg border border-border flex-shrink-0">
              <p className="text-xs text-muted-foreground">
                ⚠️ Connect this table to a node to enable automatic PR Cost calculation
              </p>
            </div>
          )}
          <ScrollArea className="flex-1 pr-4 max-h-[50vh]">
            <div className="space-y-4 py-4">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="p-4 border border-border rounded-lg space-y-3 relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Row {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeRow(row.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Client</Label>
                      <Input
                        value={row.client}
                        onChange={(e) =>
                          updateRow(row.id, 'client', e.target.value)
                        }
                        placeholder="Client name"
                        className="h-9"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Service</Label>
                      <Input
                        value={row.service}
                        onChange={(e) =>
                          updateRow(row.id, 'service', e.target.value)
                        }
                        placeholder="Service type"
                        className="h-9"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">BW (e.g., 100 Mbps)</Label>
                      <Input
                        value={row.bw}
                        onChange={(e) => updateRow(row.id, 'bw', e.target.value)}
                        placeholder="Bandwidth"
                        className="h-9"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">PR Cost (auto-calculated)</Label>
                      <Input
                        value={row.prCost}
                        readOnly
                        disabled
                        className="h-9 bg-muted/50 cursor-not-allowed"
                        placeholder="Auto-calculated"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Int Cost</Label>
                      <Input
                        value={row.intCost}
                        onChange={(e) =>
                          updateRow(row.id, 'intCost', e.target.value)
                        }
                        placeholder="Internal cost"
                        className="h-9"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Transp Cost</Label>
                      <Input
                        value={row.transpCost}
                        onChange={(e) =>
                          updateRow(row.id, 'transpCost', e.target.value)
                        }
                        placeholder="Transport cost"
                        className="h-9"
                      />
                    </div>
                    <div className="grid gap-1.5 col-span-2">
                      <Label className="text-xs">Total Cost</Label>
                      <Input
                        value={row.totalCost}
                        onChange={(e) =>
                          updateRow(row.id, 'totalCost', e.target.value)
                        }
                        placeholder="Total"
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addRow}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Row
              </Button>
            </div>
          </ScrollArea>
          <DialogFooter className="flex-shrink-0 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TableEditDialog;