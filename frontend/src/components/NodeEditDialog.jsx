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

export const NodeEditDialog = ({ node, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    rent: '',
    carryInRent: '',
  });

  useEffect(() => {
    if (node?.data) {
      setFormData({
        name: node.data.name || '',
        rent: node.data.rent || '',
        carryInRent: node.data.carryInRent || '',
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
              <Label htmlFor="rent">Rent</Label>
              <Input
                id="rent"
                value={formData.rent}
                onChange={(e) => handleChange('rent', e.target.value)}
                placeholder="Enter rent value"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="carryInRent">Carry In Rent</Label>
              <Input
                id="carryInRent"
                value={formData.carryInRent}
                onChange={(e) => handleChange('carryInRent', e.target.value)}
                placeholder="Enter carry in rent"
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