import { Router } from 'express';
import { database } from '../db.js';
const router = Router();
router.get('/', (req, res) => {
    try {
        const search = req.query.search;
        if (search) {
            const stmt = database.prepare("SELECT * FROM employees WHERE full_name LIKE ? OR empno LIKE ? ORDER BY empno");
            const employees = stmt.all(`%${search}%`, `%${search}%`);
            res.json(employees);
        }
        else {
            const stmt = database.prepare("SELECT * FROM employees ORDER BY empno");
            const employees = stmt.all();
            res.json(employees);
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/dashboard', (req, res) => {
    try {
        const employees = database.prepare("SELECT COUNT(*) as count FROM employees").get();
        const salaries = database.prepare("SELECT COUNT(*) as count FROM salaries").get();
        const runs = database.prepare("SELECT COUNT(*) as count FROM payroll_runs").get();
        res.json({
            employees: employees.count,
            salaries: salaries.count,
            runs: runs.count
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=employees.js.map