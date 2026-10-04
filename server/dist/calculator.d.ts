import type { Employee, Salary, PayrollResult } from './schema.js';
export declare function monthBounds(year: number, month: number): {
    start: Date;
    end: Date;
};
export declare function daysInMonth(year: number, month: number): number;
export declare function eligibleEmployees(year: number, month: number): Employee[];
export declare function salaryForEmployee(empno: string, year: number, month: number): Salary | undefined;
export declare function getLeave(empno: string, month: number, year: number): number;
export declare function calculateEmployee(emp: Employee, salary: Salary, leaveDays: number, year: number, month: number): Omit<PayrollResult, 'id' | 'run_id'>;
//# sourceMappingURL=calculator.d.ts.map