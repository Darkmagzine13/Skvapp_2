import { DashboardStats, Employee, Salary, LeaveInput, PayrollResult, PayrollRun } from './types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  fetchDashboard: () => request<DashboardStats>('/employees/dashboard'),
  fetchEmployees: (search?: string) => request<Employee[]>(`/employees${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  fetchSalaries: () => request<Salary[]>('/salaries'),
  importFile: async (type: 'employees' | 'salaries', file: File): Promise<{ imported: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ imported: number }>(`/${type}/import`, {
      method: 'POST',
      body: formData,
    });
  },
  fetchEligible: (month: number, year: number) => request<{ employees: Employee[]; leaves: Record<string, number> }>(`/payroll/eligible?month=${month}&year=${year}`),
  saveLeaves: (month: number, year: number, leaves: LeaveInput[]) => request<{ saved: number }>('/payroll/leaves', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month, year, leaves }),
  }),
  fetchPreview: (month: number, year: number) => request<{ results: PayrollResult[]; missing: string[] }>(`/payroll/preview?month=${month}&year=${year}`),
  savePayroll: (month: number, year: number) => request<{ run_id: number }>('/payroll/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month, year }),
  }),
  fetchHistory: () => request<PayrollRun[]>('/payroll/history'),
  fetchRun: (runId: number) => request<{ run: PayrollRun; results: PayrollResult[] }>(`/payroll/run/${runId}`),
  getExportUrl: (runId: number) => `${BASE}/payroll/export/${runId}`,
  getPayslipsUrl: (runId: number) => `${BASE}/payroll/payslips/${runId}`,
  getPayslipUrl: (runId: number, empno: string) => `${BASE}/payroll/payslip/${runId}/${empno}`,
};
