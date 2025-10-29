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
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">Client</th>
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">Service</th>
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">BW</th>
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">PR Cost</th>
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">Int Cost</th>
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">EQ $/Mbps</th>
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">Transp Cost</th>
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.rows?.slice(0, 3).map((row, index) => (
                <tr key={row.id || index} className="border-t border-border">
                  <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.client}</td>
                  <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.service}</td>
                  <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.bw}</td>
                  <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.prCost}</td>
                  <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.intCost}</td>
                  <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.eqCost}</td>
                  <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.transpCost}</td>
                  <td className="px-2 py-1.5 font-medium text-foreground whitespace-nowrap">{row.totalCost}</td>
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