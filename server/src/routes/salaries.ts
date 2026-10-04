import { Router } from 'express';
import { database } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const stmt = database.prepare(`
      SELECT s.*, e.full_name 
      FROM salaries s 
      LEFT JOIN employees e ON e.empno = s.empno 
      ORDER BY s.empno, s.valid_from DESC
    `);
    const salaries = stmt.all();
    res.json(salaries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
