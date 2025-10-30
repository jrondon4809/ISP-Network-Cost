import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Calculator } from 'lucide-react';

export const CompanyEditDialog = ({ company, onClose, onSave }) => {
  const [totalExpenses, setTotalExpenses] = useState('');
  const [totalBW, setTotalBW] = useState('');

  useEffect(() => {
    if (company) {
      setTotalExpenses(company.data.totalExpenses || '0');
      setTotalBW(company.data.totalBW || '0');
    }
  }, [company]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      totalExpenses: parseFloat(totalExpenses) || 0,
      totalBW: parseFloat(totalBW) || 0,
    });
  };

  // Calculate Expenses / Mbps
  const expensesValue = parseFloat(totalExpenses) || 0;
  const bwValue = parseFloat(totalBW) || 0;
  const expensesPerMbps = bwValue > 0 ? expensesValue / bwValue : 0;

  return (
    <Dialog open={!!company} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Company Parameters</DialogTitle>
            <DialogDescription>
              Update company-wide financial and bandwidth parameters. Expenses / Mbps is auto-calculated.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-6">
            <div className="grid gap-2">
              <Label htmlFor="totalExpenses" className="text-sm font-medium">
                Total Company Expenses ($)
              </Label>
              <Input
                id="totalExpenses"
                type="number"
                step="0.01"
                value={totalExpenses}
                onChange={(e) => setTotalExpenses(e.target.value)}
                placeholder="Enter total expenses"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Total operational expenses for the company
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="totalBW" className="text-sm font-medium">
                Total Dedicated BW in Sales (Mbps)
              </Label>
              <Input
                id="totalBW"
                type="number"
                step="0.01"
                value={totalBW}
                onChange={(e) => setTotalBW(e.target.value)}
                placeholder="Enter total bandwidth"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Total bandwidth dedicated for sales across all services
              </p>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Auto-Calculated Result</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Expenses / Mbps Formula:</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Total Company Expenses ÷ Total Dedicated BW in Sales
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-muted-foreground">Result:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${expensesPerMbps.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">/Mbps</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyEditDialog;
