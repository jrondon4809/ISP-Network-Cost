import React from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import { Table } from 'lucide-react';

// Helper function to ensure BW has Mbps unit
const formatBW = (bw) => {
  if (!bw) return '';
  const bwStr = String(bw).trim();
  if (bwStr.toLowerCase().includes('mbps')) return bwStr;
  // If it's just a number, add Mbps
  const numMatch = bwStr.match(/^(\d+(?:\.\d+)?)/);
  if (numMatch) return `${numMatch[1]} Mbps`;
  return bwStr;
};

// Helper function to ensure Price has $ prefix
const formatPrice = (price) => {
  if (!price) return '';
  const priceStr = String(price).trim();
  if (priceStr.startsWith('$')) return priceStr;
  // If it's just a number, add $
  const numMatch = priceStr.match(/^(\d+(?:\.\d+)?)/);
  if (numMatch) return `$${numMatch[1]}`;
  return priceStr;
};

export const TableNode = ({ data, selected }) => {
  // Calculate totals
  const totals = data.rows?.reduce((acc, row) => {
    // Parse BW
    const bwStr = row.bw || '0';
    const bwMatch = bwStr.match(/(\d+(?:\.\d+)?)/);
    const bw = bwMatch ? parseFloat(bwMatch[1]) : 0;
    
    // Parse CTotal
    const cTotalStr = row.cTotal || '$0';
    const cTotalMatch = cTotalStr.match(/(\d+(?:\.\d+)?)/);
    const cTotal = cTotalMatch ? parseFloat(cTotalMatch[1]) : 0;
    
    // Parse Price
    const priceStr = row.price || '$0';
    const priceMatch = priceStr.match(/(\d+(?:\.\d+)?)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
    
    return {
      bw: acc.bw + bw,
      cTotal: acc.cTotal + cTotal,
      price: acc.price + price
    };
  }, { bw: 0, cTotal: 0, price: 0 }) || { bw: 0, cTotal: 0, price: 0 };

  // Calculate total profit and %Rent
  const totalProfit = totals.price - totals.cTotal;
  const totalRentPercent = totals.price > 0 ? (totalProfit / totals.price) * 100 : 0;

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
          
          <div className="overflow-auto flex-1" style={{ maxHeight: '100%' }}>
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/50 z-10">
                <tr>
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
                {data.rows?.map((row, index) => (
                  <tr key={row.id || index} className="border-t border-border">
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.client}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.service}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{formatBW(row.bw)}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.prCost}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.intCost}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.eqCost}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.transpCost}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.eqTrans}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.gastF}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.cTotal}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.eqTotal}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{formatPrice(row.price)}</td>
                    <td className="px-2 py-1.5 text-foreground whitespace-nowrap">{row.profit}</td>
                    <td className="px-2 py-1.5 font-medium text-foreground whitespace-nowrap">{row.rentPercent}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 bg-primary/10 border-t-2 border-primary">
                <tr>
                  <td className="px-2 py-1.5 font-bold text-primary whitespace-nowrap" colSpan="2">TOTALS</td>
                  <td className="px-2 py-1.5 font-bold text-primary whitespace-nowrap">{totals.bw.toFixed(2)} Mbps</td>
                  <td className="px-2 py-1.5 text-foreground whitespace-nowrap"></td>
                  <td className="px-2 py-1.5 text-foreground whitespace-nowrap"></td>
                  <td className="px-2 py-1.5 text-foreground whitespace-nowrap"></td>
                  <td className="px-2 py-1.5 text-foreground whitespace-nowrap"></td>
                  <td className="px-2 py-1.5 text-foreground whitespace-nowrap"></td>
                  <td className="px-2 py-1.5 text-foreground whitespace-nowrap"></td>
                  <td className="px-2 py-1.5 font-bold text-primary whitespace-nowrap">${totals.cTotal.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-foreground whitespace-nowrap"></td>
                  <td className="px-2 py-1.5 font-bold text-primary whitespace-nowrap">${totals.price.toFixed(2)}</td>
                  <td className="px-2 py-1.5 font-bold text-primary whitespace-nowrap">${totalProfit.toFixed(2)}</td>
                  <td className="px-2 py-1.5 font-bold text-primary whitespace-nowrap">{totalRentPercent.toFixed(2)}%</td>
                </tr>
              </tfoot>
            </table>
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