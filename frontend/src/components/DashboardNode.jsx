import React from 'react';
import { BarChart3, DollarSign, TrendingUp, Percent } from 'lucide-react';

export const DashboardNode = ({ data }) => {
  const totalCTotal = parseFloat(data.totalCTotal) || 0;
  const totalPrice = parseFloat(data.totalPrice) || 0;
  const totalProfit = parseFloat(data.totalProfit) || 0;
  const totalRentPercent = parseFloat(data.totalRentPercent) || 0;

  return (
    <div
      className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-400 dark:border-blue-700 rounded-xl shadow-2xl p-6 min-w-[350px]"
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-blue-300 dark:border-blue-800">
        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">Network Dashboard</h2>
          <p className="text-xs text-blue-600 dark:text-blue-400">All Tables Summary</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Total CTotal */}
        <div className="bg-white/60 dark:bg-gray-900/60 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total CTotal (All Costs)</span>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            ${totalCTotal.toFixed(2)}
          </div>
        </div>

        {/* Total Price */}
        <div className="bg-white/60 dark:bg-gray-900/60 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Price (All Sales)</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${totalPrice.toFixed(2)}
          </div>
        </div>

        {/* Total Profit */}
        <div className="bg-white/60 dark:bg-gray-900/60 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Profit</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${totalProfit.toFixed(2)}
          </div>
        </div>

        {/* Total %Rent */}
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg p-4 border-2 border-green-400 dark:border-green-700">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="w-5 h-5 text-green-700 dark:text-green-300" />
            <span className="text-sm font-semibold text-green-800 dark:text-green-200">Network %Rent</span>
          </div>
          <div className="text-3xl font-bold text-green-700 dark:text-green-300">
            {totalRentPercent.toFixed(2)}%
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            (Total Profit ÷ Total Price) × 100
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNode;
