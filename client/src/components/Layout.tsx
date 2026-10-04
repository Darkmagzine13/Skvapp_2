import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navItems = [
    { to: '/', label: '📊 Dashboard', exact: true },
    { to: '/employees', label: '👥 Employees' },
    { to: '/salary-master', label: '💰 Salary Master' },
    { to: '/import', label: '📁 Import Data' },
    { to: '/payroll', label: '🧮 Run Payroll' },
    { to: '/payroll/history', label: '📋 History' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-indigo-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 flex items-center justify-center border-b border-indigo-800">
          <h1 className="text-2xl font-bold tracking-wider">SKV Payroll <span className="ml-2">💰</span></h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-700 text-white font-medium'
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
