import React from 'react';
import { Handle, Position } from 'reactflow';
import { DollarSign } from 'lucide-react';

export const NetworkNode = ({ data, selected }) => {
  return (
    <div
      className={`
        bg-node-bg border-2 rounded-xl shadow-lg transition-all duration-200
        min-w-[180px] px-4 py-3
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