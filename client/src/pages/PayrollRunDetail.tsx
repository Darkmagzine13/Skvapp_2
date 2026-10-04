import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import PayrollGrid from '../components/PayrollGrid';
import { PayrollRun, PayrollResult } from '../types';
import { useFlash } from '../components/Flash';

export default function PayrollRunDetail() {
  const { id } = useParams<{ id: string }>();
  const runId = parseInt(id || '0', 10);
  
  const [run, setRun] = useState<PayrollRun | null>(null);
  const [results, setResults] = useState<PayrollResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { flash } = useFlash();

  useEffect(() => {
    if (!runId) return;
    api.fetchRun(runId)
      .then(res => {
        setRun(res.run);
        setResults(res.results);
      })
      .catch(err => flash(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [runId, flash]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading details...</div>;
  if (!run) return <div className="text-center py-20 text-red-500">Run not found.</div>;

  const monthName = new Date(run.payroll_year, run.payroll_month - 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Link to="/payroll/history" className="text-gray-400 hover:text-indigo-600 transition-colors">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Payroll Run: {monthName} {run.payroll_year}
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-10">
            Run #{run.id} • Created on {new Date(run.created_on).toLocaleString()}
          </p>
        </div>
        <div className="space-x-3">
          <a
            href={api.getExportUrl(run.id)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            📊 Export Excel
          </a>
          <a
            href={api.getPayslipsUrl(run.id)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            📄 Bulk Payslips
          </a>
        </div>
      </div>

      <PayrollGrid results={results} showActions={true} runId={run.id} />
    </div>
  );
}
