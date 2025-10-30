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
  const [tableName, setTableName] = useState('');

  useEffect(() => {
    if (table?.data?.rows) {
      setRows(table.data.rows);
    }
    if (table?.data?.name) {
      setTableName(table.data.name);
    } else {
      setTableName('Data Table');
    }
  }, [table]);

  // Auto-calculate PR Cost, Int Cost, EQ $/Mbps, and Transp Cost whenever dialog opens or dependencies change
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

    // Calculate node total cost for PR Cost
    const rent = parseFloat(sourceNode.data.rent) || 0;
    const carryInRent = parseFloat(sourceNode.data.carryInRent) || 0;
    const nodeTotalCost = rent + carryInRent;

    // Get node internet cost for Int Cost and EQ $/Mbps
    const nodeInternetCost = parseFloat(sourceNode.data.internetCost) || 0;

    // Get link MRC for Transp Cost calculation
    const linkMrcStr = edge.data?.mrc || '$0';
    const linkMrcMatch = linkMrcStr.match(/(\d+(?:\.\d+)?)/);
    const linkMrc = linkMrcMatch ? parseFloat(linkMrcMatch[1]) : 0;

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

    // Calculate PR Cost, Int Cost, EQ $/Mbps, and Transp Cost for each row automatically
    setRows(currentRows => {
      // Calculate total sum of BW column in the table
      let totalTableBandwidth = 0;
      currentRows.forEach(row => {
        const rowBwStr = row.bw || '0';
        const rowBwMatch = rowBwStr.match(/(\d+(?:\.\d+)?)/);
        const rowBandwidth = rowBwMatch ? parseFloat(rowBwMatch[1]) : 0;
        totalTableBandwidth += rowBandwidth;
      });

      if (totalTableBandwidth === 0) {
        return currentRows; // No bandwidth in table to calculate against
      }

      // PR Cost formula: (Node Total Cost ÷ Total Outgoing BW) × Link BW ÷ Total Table BW
      const prCostPerUnit = (nodeTotalCost / totalOutgoingBandwidth) * linkBandwidth / totalTableBandwidth;

      // Int Cost formula: (Node Int Cost × Link BW) ÷ Total Table BW
      const intCostPerUnit = (nodeInternetCost * linkBandwidth) / totalTableBandwidth;

      return currentRows.map(row => {
        // Get row bandwidth
        const rowBwStr = row.bw || '0';
        const rowBwMatch = rowBwStr.match(/(\d+(?:\.\d+)?)/);
        const rowBandwidth = rowBwMatch ? parseFloat(rowBwMatch[1]) : 0;

        if (rowBandwidth === 0) {
          return {
            ...row,
            prCost: '$0.00',
            intCost: '$0.00',
            eqCost: '$0.00',
            transpCost: '$0.00',
            eqTrans: '$0.00',
            cTotal: '$0.00'
          };
        }

        // Calculate PR Cost and Int Cost
        const prCost = prCostPerUnit * rowBandwidth;
        const intCost = intCostPerUnit * rowBandwidth;
        
        // EQ $/Mbps = Int Cost ÷ Row BW
        const intCostValue = parseFloat(intCost.toFixed(2));
        const eqCost = intCostValue / rowBandwidth;
        
        // Transp Cost formula: Link MRC × Row BW ÷ Total Table BW
        const transpCost = (linkMrc * rowBandwidth) / totalTableBandwidth;
        
        // EQ Trans formula: Transp Cost ÷ Row BW
        const transpCostValue = parseFloat(transpCost.toFixed(2));
        const eqTrans = transpCostValue / rowBandwidth;
        
        // Get Gast F value (parse numeric value from string)
        const gastFStr = row.gastF || '$0';
        const gastFMatch = gastFStr.match(/(\d+(?:\.\d+)?)/);
        const gastF = gastFMatch ? parseFloat(gastFMatch[1]) : 0;
        
        // CTotal formula: PR Cost + Int Cost + Trans + Gast F
        const cTotal = prCost + intCost + transpCost + gastF;
        
        return {
          ...row,
          prCost: '$' + prCost.toFixed(2),
          intCost: '$' + intCost.toFixed(2),
          eqCost: '$' + eqCost.toFixed(2),
          transpCost: '$' + transpCost.toFixed(2),
          eqTrans: '$' + eqTrans.toFixed(2),
          cTotal: '$' + cTotal.toFixed(2)
        };
      });
    });
  }, [table, nodes, edges]); // Don't include rows in dependencies to avoid infinite loop

  const addRow = () => {
    const newRow = {
      id: Date.now(),
      client: '',
      service: '',
      bw: '',
      prCost: '$0.00',
      intCost: '$0.00',
      eqCost: '$0.00',
      transpCost: '$0.00',
      eqTrans: '$0.00',
      gastF: '',
      cTotal: '$0.00',
      eqTotal: '',
      price: '',
      profit: '',
      rentPercent: '',
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
    
    // If bandwidth or gastF field changed, trigger recalculation after a short delay
    if (field === 'bw' || field === 'gastF') {
      setTimeout(() => recalculatePRCost(), 100);
    }
  };

  const recalculatePRCost = () => {
    if (!table || !nodes || !edges) return;

    const connectedEdge = edges.find(edge => edge.target === table.id);
    if (!connectedEdge) return;

    const sourceNode = nodes.find(n => n.id === connectedEdge.source);
    if (!sourceNode || sourceNode.type !== 'networkNode') return;

    const rent = parseFloat(sourceNode.data.rent) || 0;
    const carryInRent = parseFloat(sourceNode.data.carryInRent) || 0;
    const nodeTotalCost = rent + carryInRent;
    const nodeInternetCost = parseFloat(sourceNode.data.internetCost) || 0;

    // Get link MRC for Transp Cost calculation
    const linkMrcStr = connectedEdge.data?.mrc || '$0';
    const linkMrcMatch = linkMrcStr.match(/(\d+(?:\.\d+)?)/);
    const linkMrc = linkMrcMatch ? parseFloat(linkMrcMatch[1]) : 0;

    const outgoingEdges = edges.filter(e => e.source === sourceNode.id);
    let totalOutgoingBandwidth = 0;
    outgoingEdges.forEach(outEdge => {
      const bandwidthStr = outEdge.data?.bandwidth || '100 Mbps';
      const bandwidthMatch = bandwidthStr.match(/(\d+(?:\.\d+)?)/);
      const bandwidth = bandwidthMatch ? parseFloat(bandwidthMatch[1]) : 100;
      totalOutgoingBandwidth += bandwidth;
    });

    if (totalOutgoingBandwidth === 0) return;

    const linkBandwidthStr = connectedEdge.data?.bandwidth || '100 Mbps';
    const linkBandwidthMatch = linkBandwidthStr.match(/(\d+(?:\.\d+)?)/);
    const linkBandwidth = linkBandwidthMatch ? parseFloat(linkBandwidthMatch[1]) : 100;

    setRows(currentRows => {
      let totalTableBandwidth = 0;
      currentRows.forEach(row => {
        const rowBwStr = row.bw || '0';
        const rowBwMatch = rowBwStr.match(/(\d+(?:\.\d+)?)/);
        const rowBandwidth = rowBwMatch ? parseFloat(rowBwMatch[1]) : 0;
        totalTableBandwidth += rowBandwidth;
      });

      if (totalTableBandwidth === 0) return currentRows;

      const prCostPerUnit = (nodeTotalCost / totalOutgoingBandwidth) * linkBandwidth / totalTableBandwidth;
      const intCostPerUnit = (nodeInternetCost * linkBandwidth) / totalTableBandwidth;

      return currentRows.map(row => {
        const rowBwStr = row.bw || '0';
        const rowBwMatch = rowBwStr.match(/(\d+(?:\.\d+)?)/);
        const rowBandwidth = rowBwMatch ? parseFloat(rowBwMatch[1]) : 0;

        if (rowBandwidth === 0) {
          return { ...row, prCost: '$0.00', intCost: '$0.00', eqCost: '$0.00', transpCost: '$0.00', eqTrans: '$0.00' };
        }

        const prCost = prCostPerUnit * rowBandwidth;
        const intCost = intCostPerUnit * rowBandwidth;
        
        // EQ $/Mbps = Int Cost ÷ Row BW
        const intCostValue = parseFloat(intCost.toFixed(2));
        const eqCost = intCostValue / rowBandwidth;
        
        // Transp Cost formula: Link MRC × Row BW ÷ Total Table BW
        const transpCost = (linkMrc * rowBandwidth) / totalTableBandwidth;
        
        // EQ Trans formula: Transp Cost ÷ Row BW
        const transpCostValue = parseFloat(transpCost.toFixed(2));
        const eqTrans = transpCostValue / rowBandwidth;
        
        return { 
          ...row, 
          prCost: '$' + prCost.toFixed(2),
          intCost: '$' + intCost.toFixed(2),
          eqCost: '$' + eqCost.toFixed(2),
          transpCost: '$' + transpCost.toFixed(2),
          eqTrans: '$' + eqTrans.toFixed(2)
        };
      });
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ rows, name: tableName });
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
    const nodeInternetCost = parseFloat(sourceNode.data.internetCost) || 0;
    
    // Get link MRC
    const linkMrcStr = connectedEdge.data?.mrc || '$0';
    const linkMrcMatch = linkMrcStr.match(/(\d+(?:\.\d+)?)/);
    const linkMrc = linkMrcMatch ? parseFloat(linkMrcMatch[1]) : 0;
    
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
      nodeInternetCost,
      linkMrc,
      totalOutgoingBandwidth: `${totalOutgoingBandwidth} Mbps (sum of ${outgoingEdges.length} outgoing links)`,
      linkBandwidth: `${linkBandwidth} Mbps`,
      totalTableBandwidth: `${totalTableBandwidth} Mbps`,
      outgoingLinksCount: outgoingEdges.length
    };
  };

  const connectionInfo = getConnectionInfo();

  return (
    <Dialog open={!!table} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="px-6 pt-6 flex-shrink-0">
            <DialogHeader>
              <DialogTitle>Edit Table</DialogTitle>
              <DialogDescription>
                Manage table rows and data below. PR Cost, Int Cost, EQ $/Mbps, Transp Cost, and EQ Trans are auto-calculated from connected node and link.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Label htmlFor="tableName" className="text-sm font-medium">Table Name</Label>
              <Input
                id="tableName"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Enter table name"
                className="mt-1.5"
              />
            </div>
          </div>
          {connectionInfo && (
            <div className="mx-6 my-3 p-3 bg-primary/5 rounded-lg border border-primary/20 flex-shrink-0">
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
                  <span className="font-medium">Node Int Cost:</span> ${connectionInfo.nodeInternetCost.toFixed(2)}/Mbps
                </div>
                <div>
                  <span className="font-medium">Link MRC:</span> ${connectionInfo.linkMrc.toFixed(2)}
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
              <div className="mt-2 space-y-1">
                <div className="p-2 bg-background/50 rounded text-xs">
                  <p className="font-medium text-foreground">PR Cost Formula:</p>
                  <p className="text-muted-foreground text-[11px]">
                    (Node Total Cost ÷ Total Outgoing BW) × Link BW ÷ Total Table BW × Row BW
                  </p>
                </div>
                <div className="p-2 bg-background/50 rounded text-xs">
                  <p className="font-medium text-foreground">Int Cost Formula:</p>
                  <p className="text-muted-foreground text-[11px]">
                    (Node Int Cost × Link BW) × Row BW ÷ Total Table BW
                  </p>
                </div>
                <div className="p-2 bg-background/50 rounded text-xs">
                  <p className="font-medium text-foreground">EQ $/Mbps Formula:</p>
                  <p className="text-muted-foreground text-[11px]">
                    Row Int Cost ÷ Row BW
                  </p>
                </div>
                <div className="p-2 bg-background/50 rounded text-xs">
                  <p className="font-medium text-foreground">Transp Cost Formula:</p>
                  <p className="text-muted-foreground text-[11px]">
                    Link MRC × Row BW ÷ Total Table BW
                  </p>
                </div>
                <div className="p-2 bg-background/50 rounded text-xs">
                  <p className="font-medium text-foreground">EQ Trans Formula:</p>
                  <p className="text-muted-foreground text-[11px]">
                    Row Transp Cost ÷ Row BW
                  </p>
                </div>
              </div>
            </div>
          )}
          {!connectionInfo && (
            <div className="mx-6 my-3 p-3 bg-muted/50 rounded-lg border border-border flex-shrink-0">
              <p className="text-xs text-muted-foreground">
                ⚠️ Connect this table to a node to enable automatic PR Cost calculation
              </p>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-6 min-h-0" style={{scrollbarWidth: 'thin'}}>
            <div className="space-y-4 py-4">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  id={`row-${row.id}`}
                  className="p-4 border-2 border-border rounded-lg space-y-3 relative hover:border-primary/50 transition-colors scroll-mt-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground bg-primary/10 px-2 py-1 rounded">
                      Row {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                      <Label className="text-xs">Int Cost (auto-calculated)</Label>
                      <Input
                        value={row.intCost}
                        readOnly
                        disabled
                        className="h-9 bg-muted/50 cursor-not-allowed"
                        placeholder="Auto-calculated"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">EQ $/Mbps (auto-calculated)</Label>
                      <Input
                        value={row.eqCost}
                        readOnly
                        disabled
                        className="h-9 bg-muted/50 cursor-not-allowed"
                        placeholder="Auto-calculated"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Transp Cost (auto-calculated)</Label>
                      <Input
                        value={row.transpCost}
                        readOnly
                        disabled
                        className="h-9 bg-muted/50 cursor-not-allowed"
                        placeholder="Auto-calculated"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">EQ Trans (auto-calculated)</Label>
                      <Input
                        value={row.eqTrans}
                        readOnly
                        disabled
                        className="h-9 bg-muted/50 cursor-not-allowed"
                        placeholder="Auto-calculated"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Gast F</Label>
                      <Input
                        value={row.gastF}
                        onChange={(e) =>
                          updateRow(row.id, 'gastF', e.target.value)
                        }
                        placeholder="Gast F"
                        className="h-9"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">CTotal</Label>
                      <Input
                        value={row.cTotal}
                        onChange={(e) =>
                          updateRow(row.id, 'cTotal', e.target.value)
                        }
                        placeholder="CTotal"
                        className="h-9"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">EQ Total</Label>
                      <Input
                        value={row.eqTotal}
                        onChange={(e) =>
                          updateRow(row.id, 'eqTotal', e.target.value)
                        }
                        placeholder="EQ Total"
                        className="h-9"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Price</Label>
                      <Input
                        value={row.price}
                        onChange={(e) =>
                          updateRow(row.id, 'price', e.target.value)
                        }
                        placeholder="Price"
                        className="h-9"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Profit</Label>
                      <Input
                        value={row.profit}
                        onChange={(e) =>
                          updateRow(row.id, 'profit', e.target.value)
                        }
                        placeholder="Profit"
                        className="h-9"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">%Rent</Label>
                      <Input
                        value={row.rentPercent}
                        onChange={(e) =>
                          updateRow(row.id, 'rentPercent', e.target.value)
                        }
                        placeholder="%Rent"
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 pb-4 pt-4 border-t border-border flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={addRow}
              className="w-full gap-2 h-10"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </Button>
          </div>
          <DialogFooter className="px-6 pb-6 pt-0 flex-shrink-0">
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