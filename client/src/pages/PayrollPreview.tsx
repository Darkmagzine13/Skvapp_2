import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import PayrollGrid from '../components/PayrollGrid';
import { PayrollResult } from '../types';
import { useFlash } from '../components/Flash';

export default function PayrollPreview() {
  const [searchParams] = useSearchParams();
  const month = parseInt(searchParams.get('month') || '1', 10);
  const year = parseInt(searchParams.get('year') || '2024', 10);

  const [results, setResults] = useState<PayrollResult[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const navigate = useNavigate();
  const { flash } = useFlash();

  useEffect(() => {
    api.fetchPreview(month, year)
      .then(res => {
        setResults(res.results);
        setMissing(res.missing);
      })
      .catch(err => {
        flash(err.message, 'error');
        navigate('/payroll');
      })
      .finally(() => setLoading(false));
  }, [month, year, flash, navigate]);

  const handleSave = async () => {
    if (!window.confirm('Are you sure you want to finalize this payroll run? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      await api.savePayroll(month, year);
      flash('Payroll saved successfully!', 'success');
      navigate('/payroll/history');
    } catch (err: any) {
      flash(err.message, 'error');
      setSaving(false);
    }
  };

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  if (loading) {
    return <div className="text-center py-20 text-gray-500 text-lg">Generating preview...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Payroll Preview: {monthName} {year}</h1>
        <div className="space-x-3">
          <button
            onClick={() => navigate('/payroll')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            disabled={saving}
          >
            Back to Edit
          </button>
          <button
            onClick={handleSave}
            disabled={saving || results.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Finalize'}
          </button>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Warning: Missing Salary Records</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>The following employees are eligible but have no active salary record for this month:</p>
                <p className="mt-1 font-mono bg-yellow-100 p-1 rounded inline-block">{missing.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {results.length > 0 ? (
        <PayrollGrid results={results} />
      ) : (
        <div className="bg-white p-8 text-center rounded-lg border border-gray-200 text-gray-500">
          No payroll results generated.
        </div>
      )}
    </div>
  );
}
