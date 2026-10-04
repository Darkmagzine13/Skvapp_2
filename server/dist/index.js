import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb } from './db.js';
import importRouter from './routes/import.js';
import employeesRouter from './routes/employees.js';
import salariesRouter from './routes/salaries.js';
import payrollRouter from './routes/payroll.js';
import exportsRouter from './routes/exports.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
initDb();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, '../../static')));
app.use('/api/import', importRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/salaries', salariesRouter);
app.use('/api/payroll', payrollRouter);
app.use('/api/payroll', exportsRouter);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
const PORT = process.env.PORT || 8080;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`SKV Payroll server running on http://localhost:${PORT}`);
    });
}
export default app;
//# sourceMappingURL=index.js.map