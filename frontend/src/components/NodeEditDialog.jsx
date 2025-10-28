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
import { DollarSign, Wifi } from 'lucide-react';

export const NodeEditDialog = ({ node, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    rent: '',
    carryInRent: '',
    internetInput: '',
  });

  useEffect(() => {
    if (node?.data) {
      setFormData({
        name: node.data.name || '',
        rent: node.data.rent || '',
        carryInRent: node.data.carryInRent || '',
        internetInput: node.data.internetInput || '',
      });
    }
  }, [node]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Calculate Total Cost
  const rent = parseFloat(formData.rent) || 0;
  const carryInRent = parseFloat(formData.carryInRent) || 0;
  const totalCost = rent + carryInRent;

  return (
    <Dialog open={!!node} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
            <DialogDescription>
              Update the node properties below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter node name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rent" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Rent
              </Label>
              <Input
                id="rent"
                type="number"
                step="0.01"
                value={formData.rent}
                onChange={(e) => handleChange('rent', e.target.value)}
                placeholder="Enter rent value"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="carryInRent" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Carry In Rent (Auto-calculated)
              </Label>
              <Input
                id="carryInRent"
                type="number"
                step="0.01"
                value={formData.carryInRent}
                readOnly
                disabled
                className="bg-muted cursor-not-allowed"
                placeholder="Auto-calculated from incoming link"
              />
              <p className="text-xs text-muted-foreground">
                Formula: Source Node Total Cost ÷ Link Bandwidth
              </p>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total Cost:</span>
                <span className="text-lg font-bold text-primary flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {totalCost.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Rent + Carry In Rent</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="internetInput" className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Internet INPUT (Mbps)
              </Label>
              <Input
                id="internetInput"
                type="number"
                step="1"
                value={formData.internetInput}
                onChange={(e) => handleChange('internetInput', e.target.value)}
                placeholder="Enter internet speed in Mbps"
              />
            </div>
          </div>
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

export default NodeEditDialog;