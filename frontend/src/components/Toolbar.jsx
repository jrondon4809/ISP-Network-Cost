import React from 'react';
import { Circle, Table, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const Toolbar = ({ onAddNode, onAddTable, onDelete }) => {
  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-2 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={onAddNode}
        className="w-12 h-12 rounded-xl hover:bg-primary/10 hover:text-primary"
        title="Add Node"
      >
        <Circle className="w-5 h-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onAddTable}
        className="w-12 h-12 rounded-xl hover:bg-success/10 hover:text-success"
        title="Add Table"
      >
        <Table className="w-5 h-5" />
      </Button>
      
      <Separator className="my-2 w-8" />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="w-12 h-12 rounded-xl hover:bg-destructive/10 hover:text-destructive"
        title="Delete Selected"
      >
        <Trash2 className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Toolbar;