import Decimal from 'decimal.js';
import { database } from './db.js';
import { sapCeil, sapTruncHalf, pfRound, esiCeil, toDecimal } from './math.js';
import type { Employee, Salary, PayrollResult } from './schema.js';

function toISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function monthBounds(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start, end };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function eligibleEmployees(year: number, month: number): Employee[] {
  const { start, end } = monthBounds(year, month);
  const startISO = toISO(start);
  const endISO = toISO(end);
  
  const stmt = database.prepare(`
    SELECT * FROM employees 
    WHERE (resig_date IS NULL OR resig_date > ?) AND joining_date < ? 
    ORDER BY empno
  `);
  
  return stmt.all(startISO, endISO) as Employee[];
}

export function salaryForEmployee(empno: string, year: number, month: number): Salary | undefined {
  const { start, end } = monthBounds(year, month);
  const startISO = toISO(start);
  const endISO = toISO(end);

  const stmt = database.prepare(`
    SELECT * FROM salaries 
    WHERE empno = ? AND valid_from <= ? AND valid_to >= ? 
    ORDER BY valid_from DESC LIMIT 1
  `);

  return stmt.get(empno, endISO, startISO) as Salary | undefined;
}

export function getLeave(empno: string, month: number, year: number): number {
  const stmt = database.prepare(`
    SELECT leave_days FROM leave_deductions 
    WHERE empno = ? AND payroll_month = ? AND payroll_year = ?
  `);
  
  const row = stmt.get(empno, month, year) as { leave_days: number } | undefined;
  return row ? row.leave_days : 0;
}

export function calculateEmployee(
  emp: Employee, 
  salary: Salary, 
  leaveDays: number, 
  year: number, 
  month: number
): Omit<PayrollResult, 'id' | 'run_id'> {
  const { start, end } = monthBounds(year, month);
  const days = new Decimal(end.getDate());

  let basic = toDecimal(salary.basic);
  let da = toDecimal(salary.da);
  let hra = toDecimal(salary.hra);
  let conveyance = toDecimal(salary.conveyance);
  let special = toDecimal(salary.special_allowance);

  // Mid-month proration
  const joiningDate = emp.joining_date ? new Date(emp.joining_date) : null;
  if (joiningDate && joiningDate > start) {
    const activeDays = new Decimal(
      Math.floor((end.getTime() - joiningDate.getTime()) / 86400000) + 1
    );
    basic = sapCeil(basic.div(days).mul(activeDays));
    da = sapCeil(da.div(days).mul(activeDays));
    hra = sapCeil(hra.div(days).mul(activeDays));
    conveyance = sapCeil(conveyance.div(days).mul(activeDays));
    special = sapCeil(special.div(days).mul(activeDays));
  }

  const leaveCalc = basic.plus(da).plus(hra).plus(conveyance).plus(special);
  let leaveDeduct = new Decimal(0);
  const leaveDecimal = new Decimal(leaveDays);
  if (leaveDays > 0) {
    leaveDeduct = sapTruncHalf(leaveCalc.div(days).mul(leaveDecimal));
  }

  const gross = leaveCalc.minus(leaveDeduct);

  let employeePf = new Decimal(0);
  let employerPf = new Decimal(0);
  let employerAdmin = new Decimal(0);
  if (emp.pf_applicable) {
    const pfCalc = basic.plus(da);
    const basda = pfCalc.minus(pfCalc.div(days).mul(leaveDecimal));
    employeePf = pfRound(basda.mul(new Decimal('0.12')));
    employerPf = employeePf;
    employerAdmin = pfRound(basda.mul(new Decimal('0.01')));
  }

  let employeeEsi = new Decimal(0);
  let employerEsi = new Decimal(0);
  if (emp.esi_applicable) {
    employeeEsi = esiCeil(gross.mul(new Decimal('0.0075')));
    employerEsi = esiCeil(gross.mul(new Decimal('0.0325')));
  }

  const totalDeduct = employeePf.plus(employeeEsi);
  const netSalary = gross.minus(totalDeduct);
  const totalCtc = gross.plus(employerPf).plus(employerEsi).plus(employerAdmin);

  return {
    empno: emp.empno,
    full_name: emp.full_name ?? null,
    joining_date: emp.joining_date ?? null,
    leave_days: leaveDays,
    basic: basic.toNumber(),
    da: da.toNumber(),
    hra: hra.toNumber(),
    conveyance: conveyance.toNumber(),
    special_allowance: special.toNumber(),
    leave_deduct: leaveDeduct.toNumber(),
    gross_salary: gross.toNumber(),
    employee_pf: employeePf.toNumber(),
    employer_pf: employerPf.toNumber(),
    employer_admin: employerAdmin.toNumber(),
    employee_esi: employeeEsi.toNumber(),
    employer_esi: employerEsi.toNumber(),
    total_deduct: totalDeduct.toNumber(),
    net_salary: netSalary.toNumber(),
    total_ctc: totalCtc.toNumber(),
  };
}
