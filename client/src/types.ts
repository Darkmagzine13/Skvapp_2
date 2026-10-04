export interface Employee {
  empno: string;
  emp_type: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  designation: string | null;
  joining_date: string;
  resig_date: string | null;
  pf_applicable: number;
  esi_applicable: number;
  email: string | null;
  telephone1: string | null;
  bank_ac: string | null;
  bank_name: string | null;
  aadhar_no: string | null;
  pan_no: string | null;
}

export interface Salary {
  id: number;
  empno: string;
  valid_from: string;
  valid_to: string;
  basic: number;
  da: number;
  hra: number;
  conveyance: number;
  special_allowance: number;
  full_name?: string;
}

export interface LeaveInput {
  empno: string;
  leave_days: number;
}

export interface PayrollRun {
  id: number;
  payroll_month: number;
  payroll_year: number;
  created_on: string;
  created_by: string | null;
}

export interface PayrollResult {
  id?: number;
  run_id?: number;
  empno: string;
  full_name: string | null;
  joining_date: string | null;
  leave_days: number;
  basic: number;
  da: number;
  hra: number;
  conveyance: number;
  special_allowance: number;
  leave_deduct: number;
  gross_salary: number;
  employee_pf: number;
  employer_pf: number;
  employer_admin: number;
  employee_esi: number;
  employer_esi: number;
  total_deduct: number;
  net_salary: number;
  total_ctc: number;
}

export interface DashboardStats {
  employees: number;
  salaries: number;
  runs: number;
}
