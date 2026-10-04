import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import SalaryMaster from './pages/SalaryMaster';
import Import from './pages/Import';
import Payroll from './pages/Payroll';
import PayrollPreview from './pages/PayrollPreview';
import PayrollHistory from './pages/PayrollHistory';
import PayrollRunDetail from './pages/PayrollRunDetail';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/salary-master" element={<SalaryMaster />} />
        <Route path="/import" element={<Import />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/payroll/preview" element={<PayrollPreview />} />
        <Route path="/payroll/history" element={<PayrollHistory />} />
        <Route path="/payroll/run/:id" element={<PayrollRunDetail />} />
      </Routes>
    </Layout>
  );
}
