import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'payroll.db');

export const database = new Database(DB_PATH);

export function initDb() {
  database.exec('PRAGMA journal_mode = WAL;');
  database.exec('PRAGMA foreign_keys = ON;');

  database.exec(`
    CREATE TABLE IF NOT EXISTS employees (
        empno TEXT PRIMARY KEY,
        emp_type TEXT,
        first_name TEXT,
        last_name TEXT,
        full_name TEXT,
        designation TEXT,
        dob TEXT,
        gender TEXT,
        qualification TEXT,
        pre_exp TEXT,
        telephone1 TEXT,
        telephone2 TEXT,
        job_profile TEXT,
        joining_date TEXT NOT NULL,
        email TEXT,
        street TEXT,
        street2 TEXT,
        street3 TEXT,
        city TEXT,
        state TEXT,
        ctr TEXT,
        postal_code TEXT,
        doc_sub TEXT,
        resig_date TEXT,
        resig_reason TEXT,
        aadhar_no TEXT,
        pan_no TEXT,
        bank_ac TEXT,
        bank_name TEXT,
        prev_esi TEXT,
        prev_pf TEXT,
        curr_esi TEXT,
        current_pf TEXT,
        age TEXT,
        community TEXT,
        religion TEXT,
        caste TEXT,
        marital_status TEXT,
        pf_applicable INTEGER DEFAULT 0,
        esi_applicable INTEGER DEFAULT 0,
        created_by TEXT,
        created_on TEXT
    );

    CREATE TABLE IF NOT EXISTS salaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empno TEXT NOT NULL,
        valid_from TEXT NOT NULL,
        valid_to TEXT NOT NULL,
        basic REAL DEFAULT 0,
        da REAL DEFAULT 0,
        hra REAL DEFAULT 0,
        conveyance REAL DEFAULT 0,
        special_allowance REAL DEFAULT 0,
        FOREIGN KEY(empno) REFERENCES employees(empno)
    );

    CREATE TABLE IF NOT EXISTS leave_deductions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empno TEXT NOT NULL,
        payroll_month INTEGER NOT NULL,
        payroll_year INTEGER NOT NULL,
        leave_days REAL NOT NULL DEFAULT 0,
        UNIQUE(empno, payroll_month, payroll_year)
    );

    CREATE TABLE IF NOT EXISTS payroll_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payroll_month INTEGER NOT NULL,
        payroll_year INTEGER NOT NULL,
        created_on TEXT NOT NULL,
        created_by TEXT,
        UNIQUE(payroll_month, payroll_year)
    );

    CREATE TABLE IF NOT EXISTS payroll_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id INTEGER NOT NULL,
        empno TEXT NOT NULL,
        full_name TEXT,
        joining_date TEXT,
        leave_days REAL,
        basic REAL,
        da REAL,
        hra REAL,
        conveyance REAL,
        special_allowance REAL,
        leave_deduct REAL,
        gross_salary REAL,
        employee_pf REAL,
        employer_pf REAL,
        employer_admin REAL,
        employee_esi REAL,
        employer_esi REAL,
        total_deduct REAL,
        net_salary REAL,
        total_ctc REAL,
        FOREIGN KEY(run_id) REFERENCES payroll_runs(id)
    );
  `);
}
