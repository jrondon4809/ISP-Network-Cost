import React from 'react';
import { Handle, Position } from 'reactflow';
import { Building2 } from 'lucide-react';

export const CompanyNode = ({ data, selected }) => {
  // Calculate Expenses / Mbps
  const totalExpenses = parseFloat(data.totalExpenses) || 0;
  const totalBW = parseFloat(data.totalBW) || 0;
  const expensesPerMbps = totalBW > 0 ? totalExpenses / totalBW : 0;

  return (
    <div
      className={`
        bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950
        border-2 rounded-xl shadow-lg transition-all duration-200 min-w-[280px]
        ${selected ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-xl' : 'border-purple-300 dark:border-purple-700'}
        hover:shadow-xl
      `}
    >
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-purple-500 border-2 border-white dark:border-gray-900"
      />
      
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">Company</h3>
            <p className="text-xs text-purple-600 dark:text-purple-400">Network Overview</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Total Company Expenses</span>
            </div>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
              ${totalExpenses.toFixed(2)}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Total Dedicated BW in Sales</span>
            </div>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
              {totalBW.toFixed(2)} Mbps
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-lg p-3 border border-purple-300 dark:border-purple-700">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-purple-800 dark:text-purple-200">Expenses / Mbps</span>
              <span className="text-xs text-purple-600 dark:text-purple-400">(auto)</span>
            </div>
            <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
              ${expensesPerMbps.toFixed(2)}/Mbps
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyNode;
