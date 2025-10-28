import React from 'react';
import { Handle, Position } from 'reactflow';
import { DollarSign, Wifi } from 'lucide-react';

export const NetworkNode = ({ data, selected }) => {
  // Calculate Total Cost
  const rent = parseFloat(data.rent) || 0;
  const carryInRent = parseFloat(data.carryInRent) || 0;
  const totalCost = rent + carryInRent;
  
  return (
    <div
      className={`
        bg-node-bg border-2 rounded-xl shadow-lg transition-all duration-200
        min-w-[200px] px-4 py-3
        ${selected ? 'border-primary ring-2 ring-primary/20 shadow-xl' : 'border-node-border'}
        hover:shadow-xl
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary border-2 border-node-bg"
      />
      
      <div className="space-y-2">
        <div className="text-center">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {data.name}
          </h3>
        </div>
        
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between gap-2 p-1.5 bg-muted/50 rounded">
            <span className="text-muted-foreground">Rent:</span>
            <span className="font-medium text-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {data.rent}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 p-1.5 bg-muted/50 rounded">
            <span className="text-muted-foreground">Carry In:</span>
            <span className="font-medium text-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {data.carryInRent}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 p-1.5 bg-primary/10 rounded border border-primary/20">
            <span className="text-primary font-medium">Total Cost:</span>
            <span className="font-semibold text-primary flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {totalCost.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 p-1.5 bg-success/10 rounded border border-success/20">
            <span className="text-success font-medium">Internet:</span>
            <span className="font-medium text-success flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              {data.internetInput || '0'} Mbps
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 p-1.5 bg-warning/10 rounded border border-warning/20">
            <span className="text-warning font-medium">Int Cost:</span>
            <span className="font-medium text-warning flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {data.internetCost || '0'}/Mbps
            </span>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary border-2 border-node-bg"
      />
    </div>
  );
};

export default NetworkNode;