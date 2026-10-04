import { useEffect, useState } from 'react';
import { api } from '../api';
import { Salary } from '../types';
import { useFlash } from '../components/Flash';

export default function SalaryMaster() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const { flash } = useFlash();

  useEffect(() => {
    api.fetchSalaries()
      .then(setSalaries)
      .catch(err => flash(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [flash]);

  const formatCurrency = (val: number) => val.toLocaleString('en-IN');

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Salary Master</h1>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emp No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid From</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid To</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Basic</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">DA</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">HRA</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Conv</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sp.Allow</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaries.map(sal => (
                <tr key={sal.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{sal.empno}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{sal.full_name || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(sal.valid_from).toLocaleDateString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(sal.valid_to).getFullYear() > 8000 ? 'Active' : new Date(sal.valid_to).toLocaleDateString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right tabular-nums">{formatCurrency(sal.basic)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right tabular-nums">{formatCurrency(sal.da)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right tabular-nums">{formatCurrency(sal.hra)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right tabular-nums">{formatCurrency(sal.conveyance)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right tabular-nums">{formatCurrency(sal.special_allowance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
