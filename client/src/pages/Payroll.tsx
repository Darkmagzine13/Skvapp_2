import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import MonthYearPicker from '../components/MonthYearPicker';
import { Employee } from '../types';
import { useFlash } from '../components/Flash';

export default function Payroll() {
  const date = new Date();
  const [month, setMonth] = useState(date.getMonth() + 1);
  const [year, setYear] = useState(date.getFullYear());
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { flash } = useFlash();
  const navigate = useNavigate();
  const leaveRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchEligible = useCallback(async (m: number, y: number) => {
    setLoading(true);
    try {
      const res = await api.fetchEligible(m, y);
      setEmployees(res.employees);
      setLeaves(res.leaves);
    } catch (err: any) {
      flash(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [flash]);

  useEffect(() => {
    fetchEligible(month, year);
  }, [month, year, fetchEligible]);

  const handleSubmit = async () => {
    const leaveInputs = employees.map(emp => {
      const input = leaveRefs.current[emp.empno];
      const val = input ? parseFloat(input.value) : 0;
      return { empno: emp.empno, leave_days: isNaN(val) ? 0 : val };
    });

    setSaving(true);
    try {
      await api.saveLeaves(month, year, leaveInputs);
      navigate(`/payroll/preview?month=${month}&year=${year}`);
    } catch (err: any) {
      flash(err.message, 'error');
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Run Payroll</h1>
        <MonthYearPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Eligible Employees
          </h3>
          <button
            onClick={handleSubmit}
            disabled={saving || loading || employees.length === 0}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Processing...' : 'Proceed to Preview'}
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading eligible employees...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emp No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Days</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map(emp => (
                  <tr key={emp.empno} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.empno}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.designation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        defaultValue={leaves[emp.empno] || 0}
                        ref={(el) => (leaveRefs.current[emp.empno] = el)}
                        className="border border-gray-300 rounded-md w-20 px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No eligible employees found for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
