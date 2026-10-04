import { useEffect, useState } from 'react';
import { api } from '../api';
import { Employee } from '../types';
import { useFlash } from '../components/Flash';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { flash } = useFlash();

  useEffect(() => {
    api.fetchEmployees()
      .then(setEmployees)
      .catch(err => flash(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [flash]);

  const filtered = employees.filter(e => 
    e.empno.toLowerCase().includes(search.toLowerCase()) || 
    (e.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
        <input
          type="text"
          placeholder="Search by ID or Name..."
          className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emp No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resignation Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PF</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ESI</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(emp => (
                <tr key={emp.empno} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.empno}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(emp.joining_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.resig_date ? new Date(emp.resig_date).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{emp.pf_applicable ? '✓' : '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{emp.esi_applicable ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
