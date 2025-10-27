import React from 'react';
import { Handle, Position } from 'reactflow';
import { Table } from 'lucide-react';

export const TableNode = ({ data, selected }) => {
  return (
    <div
      className={`
        bg-node-bg border-2 rounded-xl shadow-lg transition-all duration-200
        ${selected ? 'border-success ring-2 ring-success/20 shadow-xl' : 'border-border'}
        hover:shadow-xl
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-success border-2 border-node-bg"
      />
      
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
            <Table className="w-4 h-4 text-success" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Data Table</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">Client</th>
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">Service</th>
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">BW</th>
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">PR Cost</th>
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">Int Cost</th>
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.rows?.slice(0, 3).map((row, index) => (
                <tr key={row.id || index} className="border-t border-border">
                  <td className="px-2 py-1.5 text-foreground">{row.client}</td>
                  <td className="px-2 py-1.5 text-foreground">{row.service}</td>
                  <td className="px-2 py-1.5 text-foreground">{row.bw}</td>
                  <td className="px-2 py-1.5 text-foreground">{row.prCost}</td>
                  <td className="px-2 py-1.5 text-foreground">{row.intCost}</td>
                  <td className="px-2 py-1.5 font-medium text-foreground">{row.totalCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.rows?.length > 3 && (
            <div className="text-xs text-center text-muted-foreground mt-2">
              +{data.rows.length - 3} more rows
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-success border-2 border-node-bg"
      />
    </div>
  );
};

export default TableNode;