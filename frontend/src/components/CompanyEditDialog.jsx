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
      ...company.data,
      totalExpenses: parseFloat(totalExpenses) || 0,
      totalBW: parseFloat(totalBW) || 0,
    });
  };

  // Calculate Expenses / Mbps
  const expensesValue = parseFloat(totalExpenses) || 0;
  const bwValue = parseFloat(totalBW) || 0;
  const expensesPerMbps = bwValue > 0 ? expensesValue / bwValue : 0;

  // Get auto-calculated values from company data
  const revenue = parseFloat(company?.data?.revenue) || 0;
  const profit = parseFloat(company?.data?.profit) || 0;
  const rentPercent = parseFloat(company?.data?.rentPercent) || 0;

  return (
    <Dialog open={!!company} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Company Parameters</DialogTitle>
            <DialogDescription>
              Update company-wide financial and bandwidth parameters. All calculated values are automatically updated from network tables.
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

            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Auto-Calculated Results</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Expenses / Mbps:</p>
                  <p className="text-xs text-muted-foreground mb-1">
                    Total Company Expenses ÷ Total Dedicated BW in Sales
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      ${expensesPerMbps.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">/Mbps</span>
                  </div>
                </div>

                <div className="border-t border-purple-200 dark:border-purple-800 pt-3">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1">Revenue:</p>
                  <p className="text-xs text-muted-foreground mb-1">
                    Sum of all Tables' Price Column Totals
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-green-900 dark:text-green-100">
                      ${revenue.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-purple-200 dark:border-purple-800 pt-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Profit:</p>
                  <p className="text-xs text-muted-foreground mb-1">
                    Sum of all Tables' Profit Column Totals
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      ${profit.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-purple-200 dark:border-purple-800 pt-3">
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Rent%:</p>
                  <p className="text-xs text-muted-foreground mb-1">
                    (Profit ÷ Revenue) × 100
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-amber-900 dark:text-amber-100">
                      {rentPercent.toFixed(2)}%
                    </span>
                  </div>
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
