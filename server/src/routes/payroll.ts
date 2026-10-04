import { Router } from 'express';
import { database } from '../db.js';
import { SaveLeaveSchema, PayrollPeriodSchema } from '../schema.js';
import { eligibleEmployees, salaryForEmployee, getLeave, calculateEmployee } from '../calculator.js';

const router = Router();

router.get('/eligible', (req, res) => {
  try {
    const month = parseInt(req.query.month as string, 10);
    const year = parseInt(req.query.year as string, 10);
    
    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ error: 'Invalid month or year' });
    }

    const employees = eligibleEmployees(month, year);
    
    const stmt = database.prepare(`
      SELECT empno, leave_days 
      FROM leave_deductions 
      WHERE payroll_month = ? AND payroll_year = ?
    `);
    const savedLeaves = stmt.all(month, year) as { empno: string, leave_days: number }[];
    
    const leaves: Record<string, number> = {};
    for (const record of savedLeaves) {
      leaves[record.empno] = record.leave_days;
    }

    res.json({ employees, leaves });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/leaves', (req, res) => {
  try {
    const data = SaveLeaveSchema.parse(req.body);
    
    const stmt = database.prepare(`
      INSERT INTO leave_deductions (empno, payroll_month, payroll_year, leave_days)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(empno, payroll_month, payroll_year) DO UPDATE SET leave_days = excluded.leave_days
    `);
    
    let count = 0;
    const transaction = database.transaction((entries: typeof data) => {
      for (const entry of entries) {
        stmt.run(entry.empno, entry.payroll_month, entry.payroll_year, entry.leave_days);
        count++;
      }
    });
    
    transaction(data);
    res.json({ saved: count });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/preview', (req, res) => {
  try {
    const month = parseInt(req.query.month as string, 10);
    const year = parseInt(req.query.year as string, 10);
    
    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ error: 'Invalid month or year' });
    }

    const employees = eligibleEmployees(month, year);
    const results = [];
    const missing = [];

    for (const emp of employees) {
      const salary = salaryForEmployee(emp.empno, month, year);
      if (!salary) {
        missing.push(emp.empno);
      } else {
        const leaveDays = getLeave(emp.empno, month, year);
        const calc = calculateEmployee(emp, salary, leaveDays, month, year);
        results.push(calc);
      }
    }

    res.json({ results, missing });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/save', (req, res) => {
  try {
    const { month, year } = req.body;
    
    if (typeof month !== 'number' || typeof year !== 'number') {
      return res.status(400).json({ error: 'Invalid month or year' });
    }

    const employees = eligibleEmployees(month, year);
    
    let runId: number | bigint = 0;
    
    const transaction = database.transaction(() => {
      const upsertRunStmt = database.prepare(`
        INSERT INTO payroll_runs (payroll_month, payroll_year, created_on, created_by)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(payroll_month, payroll_year) DO UPDATE SET created_on = excluded.created_on, created_by = excluded.created_by
        RETURNING run_id
      `);
      
      const runResult = upsertRunStmt.get(month, year, new Date().toISOString(), 'system') as { run_id: number | bigint };
      runId = runResult.run_id;
      
      const deleteResultsStmt = database.prepare(`DELETE FROM payroll_results WHERE run_id = ?`);
      deleteResultsStmt.run(runId);
      
      const insertResultStmt = database.prepare(`
        INSERT INTO payroll_results (
          run_id, empno, full_name, basic, da, hra, special_allowance, 
          conveyance, gross, pf, esi, total_deduction, net_salary, leave_days
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      for (const emp of employees) {
        const salary = salaryForEmployee(emp.empno, month, year);
        if (salary) {
          const leaveDays = getLeave(emp.empno, month, year);
          const calc = calculateEmployee(emp, salary, leaveDays, month, year);
          
          insertResultStmt.run(
            runId, calc.empno, calc.full_name, calc.basic, calc.da, calc.hra,
            calc.special_allowance, calc.conveyance, calc.gross, calc.pf, calc.esi,
            calc.total_deduction, calc.net_salary, calc.leave_days
          );
        }
      }
    });

    transaction();
    res.json({ run_id: Number(runId) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', (req, res) => {
  try {
    const stmt = database.prepare("SELECT * FROM payroll_runs ORDER BY payroll_year DESC, payroll_month DESC");
    const history = stmt.all();
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/run/:runId', (req, res) => {
  try {
    const runId = parseInt(req.params.runId, 10);
    if (isNaN(runId)) {
      return res.status(400).json({ error: 'Invalid runId' });
    }

    const runStmt = database.prepare("SELECT * FROM payroll_runs WHERE run_id = ?");
    const run = runStmt.get(runId);
    
    if (!run) {
      return res.status(404).json({ error: 'Run not found' });
    }

    const resultsStmt = database.prepare("SELECT * FROM payroll_results WHERE run_id = ? ORDER BY empno");
    const results = resultsStmt.all(runId);

    res.json({ run, results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
