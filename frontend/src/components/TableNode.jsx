import React from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import { Table } from 'lucide-react';

export const TableNode = ({ data, selected }) => {
  const maxVisibleRows = data.maxVisibleRows || 3;
  
  return (
    <>
      <NodeResizer
        color="hsl(var(--success))"
        isVisible={selected}
        minWidth={300}
        minHeight={150}
      />
      <div
        className={`
          bg-node-bg border-2 rounded-xl shadow-lg transition-all duration-200 h-full w-full
          ${selected ? 'border-success ring-2 ring-success/20 shadow-xl' : 'border-border'}
          hover:shadow-xl
        `}
        style={{ overflow: 'hidden' }}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-success border-2 border-node-bg"
        />
        
        <div className="p-3 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <Table className="w-4 h-4 text-success" />
            </div>
            <h3 className="text-sm font-semibold text-foreground truncate">{data.name || 'Data Table'}</h3>
          </div>
          
          <div className="overflow-auto flex-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">Client</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">Service</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">BW</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">PR Cost</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">Int Cost</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">EQ $/Mbps</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">Trans</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">EQ Trans</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">Gast F</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">CTotal</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">EQ Total</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">Price</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">Profit</th>
                  <th className="px-2 py-1.5 text-left text-muted-foreground font-medium whitespace-nowrap">%Rent</th>
                </tr>
              </thead>
              <tbody>
                {data.rows?.slice(0, maxVisibleRows).map((row, index) => (
                  <tr key={row.id || index} className="border-t border-border">
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.client}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.service}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.bw}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.prCost}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.intCost}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.eqCost}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.transpCost}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.eqTrans}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.gastF}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.cTotal}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.eqTotal}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.price}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.profit}</td>
                    <td className="px-2 py-1.5 font-medium text-foreground whitespace-nowrap">{row.rentPercent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.rows?.length > maxVisibleRows && (
              <div className="text-xs text-center text-muted-foreground mt-2 pb-2">
                +{data.rows.length - maxVisibleRows} more rows
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
    </>
  );
};

export default TableNode;