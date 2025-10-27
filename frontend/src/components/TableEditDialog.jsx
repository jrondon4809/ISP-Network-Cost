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
import { Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const TableEditDialog = ({ table, onSave, onClose }) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (table?.data?.rows) {
      setRows(table.data.rows);
    }
  }, [table]);

  const addRow = () => {
    const newRow = {
      id: Date.now(),
      client: '',
      service: '',
      bw: '',
      prCost: '',
      intCost: '',
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

  return (
    <Dialog open={!!table} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>
              Manage table rows and data below.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] pr-4">
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
                      <Label className="text-xs">BW</Label>
                      <Input
                        value={row.bw}
                        onChange={(e) => updateRow(row.id, 'bw', e.target.value)}
                        placeholder="Bandwidth"
                        className="h-9"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">PR Cost</Label>
                      <Input
                        value={row.prCost}
                        onChange={(e) =>
                          updateRow(row.id, 'prCost', e.target.value)
                        }
                        placeholder="PR cost"
                        className="h-9"
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
          <DialogFooter>
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