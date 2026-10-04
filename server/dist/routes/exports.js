import { Router } from 'express';
import { database } from '../db.js';
import { buildExcelExport } from '../excel.js';
import { buildPayslipPdf } from '../pdf.js';
const router = Router();
router.get('/export/:runId', async (req, res) => {
    try {
        const runId = parseInt(req.params.runId, 10);
        const run = database.prepare("SELECT * FROM payroll_runs WHERE run_id = ?").get(runId);
        if (!run)
            return res.status(404).json({ error: 'Run not found' });
        const results = database.prepare("SELECT * FROM payroll_results WHERE run_id = ? ORDER BY empno").all(runId);
        const employees = database.prepare("SELECT empno, designation FROM employees").all();
        const designationMap = new Map();
        for (const e of employees) {
            designationMap.set(e.empno, e.designation);
        }
        const buffer = await buildExcelExport(results, run, designationMap);
        const mm = run.payroll_month.toString().padStart(2, '0');
        const yyyy = run.payroll_year;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Salary_${mm}_${yyyy}.xlsx"`);
        res.send(buffer);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/payslips/:runId', async (req, res) => {
    try {
        const runId = parseInt(req.params.runId, 10);
        const run = database.prepare("SELECT * FROM payroll_runs WHERE run_id = ?").get(runId);
        if (!run)
            return res.status(404).json({ error: 'Run not found' });
        const results = database.prepare("SELECT * FROM payroll_results WHERE run_id = ? ORDER BY empno").all(runId);
        const buffer = await buildPayslipPdf(results, run);
        const mm = run.payroll_month.toString().padStart(2, '0');
        const yyyy = run.payroll_year;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Payslips_${mm}_${yyyy}.pdf"`);
        res.send(buffer);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/payslip/:runId/:empno', async (req, res) => {
    try {
        const runId = parseInt(req.params.runId, 10);
        const empno = req.params.empno;
        const run = database.prepare("SELECT * FROM payroll_runs WHERE run_id = ?").get(runId);
        if (!run)
            return res.status(404).json({ error: 'Run not found' });
        const result = database.prepare("SELECT * FROM payroll_results WHERE run_id = ? AND empno = ?").get(runId, empno);
        if (!result)
            return res.status(404).json({ error: 'Result not found' });
        const buffer = await buildPayslipPdf([result], run);
        const mm = run.payroll_month.toString().padStart(2, '0');
        const yyyy = run.payroll_year;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Payslip_${empno}_${mm}_${yyyy}.pdf"`);
        res.send(buffer);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=exports.js.map