import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { PayrollRun } from '../types';
import { useFlash } from '../components/Flash';

export default function PayrollHistory() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const { flash } = useFlash();

  useEffect(() => {
    api.fetchHistory()
      .then(setRuns)
      .catch(err => flash(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [flash]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Payroll History</h1>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month / Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {runs.map(run => {
                const monthName = new Date(run.payroll_year, run.payroll_month - 1).toLocaleString('default', { month: 'long' });
                return (
                  <tr key={run.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{run.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{monthName} {run.payroll_year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(run.created_on).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-4">
                      <Link to={`/payroll/run/${run.id}`} className="text-indigo-600 hover:text-indigo-900">
                        View Details
                      </Link>
                      <a href={api.getExportUrl(run.id)} className="text-green-600 hover:text-green-900">
                        Download Excel
                      </a>
                      <a href={api.getPayslipsUrl(run.id)} target="_blank" rel="noreferrer" className="text-purple-600 hover:text-purple-900">
                        Bulk Payslips
                      </a>
                    </td>
                  </tr>
                );
              })}
              {runs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    No payroll runs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
