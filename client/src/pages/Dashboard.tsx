import { useEffect, useState } from 'react';
import MetricCard from '../components/MetricCard';
import { api } from '../api';
import { DashboardStats } from '../types';
import { useFlash } from '../components/Flash';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { flash } = useFlash();

  useEffect(() => {
    api.fetchDashboard()
      .then(setStats)
      .catch((err) => flash(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [flash]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm p-6 h-32" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard title="Total Employees" value={stats.employees} icon="👥" color="border-indigo-500" />
          <MetricCard title="Salary Records" value={stats.salaries} icon="💰" color="border-green-500" />
          <MetricCard title="Payroll Runs" value={stats.runs} icon="🧮" color="border-purple-500" />
        </div>
      ) : null}
    </div>
  );
}
