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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const EdgeEditDialog = ({ edge, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    proveedor: '',
    bandwidth: '',
    mrc: '',
    linkType: 'solid',
  });

  useEffect(() => {
    if (edge?.data) {
      setFormData({
        proveedor: edge.data.proveedor || '',
        bandwidth: edge.data.bandwidth || '',
        mrc: edge.data.mrc || '',
        linkType: edge.data.linkType || 'solid',
      });
    }
  }, [edge]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={!!edge} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
            <DialogDescription>
              Update the link properties below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                value={formData.proveedor}
                onChange={(e) => handleChange('proveedor', e.target.value)}
                placeholder="Enter provider name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bandwidth">Bandwidth</Label>
              <Input
                id="bandwidth"
                value={formData.bandwidth}
                onChange={(e) => handleChange('bandwidth', e.target.value)}
                placeholder="e.g., 100 Mbps"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mrc">MRC</Label>
              <Input
                id="mrc"
                value={formData.mrc}
                onChange={(e) => handleChange('mrc', e.target.value)}
                placeholder="e.g., $100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="linkType">Link Type</Label>
              <Select
                value={formData.linkType}
                onValueChange={(value) => handleChange('linkType', value)}
              >
                <SelectTrigger id="linkType">
                  <SelectValue placeholder="Select link type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid Line (Blue)</SelectItem>
                  <SelectItem value="dashed">Dashed Line (Green)</SelectItem>
                  <SelectItem value="arrow">Animated Arrow (Purple)</SelectItem>
                </SelectContent>
              </Select>
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

export default EdgeEditDialog;