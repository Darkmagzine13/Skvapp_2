import React, { useMemo } from 'react';
import { PayrollResult } from '../types';
import { api } from '../api';

interface PayrollGridProps {
  results: PayrollResult[];
  showActions?: boolean;
  runId?: number;
}

const formatCurrency = (value: number) => 
  value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const PayrollGrid = React.memo(({ results, showActions = false, runId }: PayrollGridProps) => {
  const totals = useMemo(() => {
    return results.reduce(
      (acc, curr) => ({
        basic: acc.basic + curr.basic,
        da: acc.da + curr.da,
        hra: acc.hra + curr.hra,
        conveyance: acc.conveyance + curr.conveyance,
        special_allowance: acc.special_allowance + curr.special_allowance,
        leave_deduct: acc.leave_deduct + curr.leave_deduct,
        gross_salary: acc.gross_salary + curr.gross_salary,
        employee_pf: acc.employee_pf + curr.employee_pf,
        employee_esi: acc.employee_esi + curr.employee_esi,
        total_deduct: acc.total_deduct + curr.total_deduct,
        net_salary: acc.net_salary + curr.net_salary,
      }),
      {
        basic: 0, da: 0, hra: 0, conveyance: 0, special_allowance: 0,
        leave_deduct: 0, gross_salary: 0, employee_pf: 0, employee_esi: 0,
        total_deduct: 0, net_salary: 0,
      }
    );
  }, [results]);

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="sticky left-0 bg-gray-50 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">#</th>
            <th className="sticky left-[40px] bg-gray-50 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r z-10 whitespace-nowrap">Emp ID</th>
            <th className="sticky left-[120px] bg-gray-50 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r z-10 whitespace-nowrap min-w-[150px]">Name</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Basic</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">DA</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">HRA</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sp.Allow</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Conv</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Days</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Ded.</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-indigo-50 font-bold">Gross</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">PF</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ESI</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-50 font-bold">Total Ded.</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50 font-bold">Net Salary</th>
            {showActions && <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((row, idx) => (
            <tr key={row.empno} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className={`sticky left-0 px-3 py-2 text-sm text-gray-500 border-r ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>{idx + 1}</td>
              <td className={`sticky left-[40px] px-3 py-2 text-sm font-medium text-gray-900 border-r z-10 whitespace-nowrap ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>{row.empno}</td>
              <td className={`sticky left-[120px] px-3 py-2 text-sm text-gray-900 border-r z-10 whitespace-nowrap min-w-[150px] ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>{row.full_name}</td>
              <td className="px-3 py-2 text-sm text-gray-500 text-right tabular-nums">{formatCurrency(row.basic)}</td>
              <td className="px-3 py-2 text-sm text-gray-500 text-right tabular-nums">{formatCurrency(row.da)}</td>
              <td className="px-3 py-2 text-sm text-gray-500 text-right tabular-nums">{formatCurrency(row.hra)}</td>
              <td className="px-3 py-2 text-sm text-gray-500 text-right tabular-nums">{formatCurrency(row.special_allowance)}</td>
              <td className="px-3 py-2 text-sm text-gray-500 text-right tabular-nums">{formatCurrency(row.conveyance)}</td>
              <td className="px-3 py-2 text-sm text-gray-500 text-right">{row.leave_days}</td>
              <td className="px-3 py-2 text-sm text-gray-500 text-right tabular-nums">{formatCurrency(row.leave_deduct)}</td>
              <td className="px-3 py-2 text-sm text-indigo-700 font-semibold text-right tabular-nums bg-indigo-50">{formatCurrency(row.gross_salary)}</td>
              <td className="px-3 py-2 text-sm text-gray-500 text-right tabular-nums">{formatCurrency(row.employee_pf)}</td>
              <td className="px-3 py-2 text-sm text-gray-500 text-right tabular-nums">{formatCurrency(row.employee_esi)}</td>
              <td className="px-3 py-2 text-sm text-red-700 font-semibold text-right tabular-nums bg-red-50">{formatCurrency(row.total_deduct)}</td>
              <td className="px-3 py-2 text-sm text-green-700 font-bold text-right tabular-nums bg-green-50">{formatCurrency(row.net_salary)}</td>
              {showActions && runId && (
                <td className="px-3 py-2 text-sm text-center">
                  <a href={api.getPayslipUrl(runId, row.empno)} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-900">
                    Payslip
                  </a>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-100 font-bold text-gray-900">
          <tr>
            <td colSpan={3} className="sticky left-0 bg-gray-100 px-3 py-3 text-right border-r z-10">Total</td>
            <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(totals.basic)}</td>
            <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(totals.da)}</td>
            <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(totals.hra)}</td>
            <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(totals.special_allowance)}</td>
            <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(totals.conveyance)}</td>
            <td className="px-3 py-3 text-right">-</td>
            <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(totals.leave_deduct)}</td>
            <td className="px-3 py-3 text-right tabular-nums text-indigo-800 bg-indigo-100">{formatCurrency(totals.gross_salary)}</td>
            <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(totals.employee_pf)}</td>
            <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(totals.employee_esi)}</td>
            <td className="px-3 py-3 text-right tabular-nums text-red-800 bg-red-100">{formatCurrency(totals.total_deduct)}</td>
            <td className="px-3 py-3 text-right tabular-nums text-green-800 bg-green-100">{formatCurrency(totals.net_salary)}</td>
            {showActions && <td></td>}
          </tr>
        </tfoot>
      </table>
    </div>
  );
});

export default PayrollGrid;
