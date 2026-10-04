import { database } from './db.js';
import { toDecimal } from './math.js';
export function parseDate(s) {
    if (!s || s === '0' || s === '00.00.0000')
        return null;
    let year = '', month = '', day = '';
    if (s.includes('.')) {
        const parts = s.split('.');
        if (parts.length === 3) {
            day = parts[0];
            month = parts[1];
            year = parts[2];
        }
    }
    else if (s.includes('-')) {
        const parts = s.split('-');
        if (parts.length === 3) {
            year = parts[0];
            month = parts[1];
            day = parts[2];
        }
    }
    else if (s.includes('/')) {
        const parts = s.split('/');
        if (parts.length === 3) {
            day = parts[0];
            month = parts[1];
            year = parts[2];
        }
    }
    if (year && month && day) {
        const dt = new Date(`${year}-${month}-${day}`);
        if (!isNaN(dt.getTime())) {
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
    return null;
}
export function parseSapDynamicFile(buffer) {
    const str = buffer.toString('utf16le').replace(/^\uFEFF/, '');
    const lines = str.split('\n').map(l => l.replace(/\r$/, ''));
    const headerIdx = lines.findIndex(l => l.includes('Emp No'));
    if (headerIdx === -1) {
        throw new Error('Header row with "Emp No" not found');
    }
    let headers = lines[headerIdx].split('\t');
    let startCol = 0;
    if (headers[0].trim() === '' && headers.length > 1) {
        headers.shift();
        startCol = 1;
    }
    headers = headers.map(h => h.trim());
    const results = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '')
            continue;
        let cols = line.split('\t');
        if (startCol === 1) {
            cols.shift();
        }
        const rowObj = {};
        for (let j = 0; j < headers.length; j++) {
            rowObj[headers[j]] = (cols[j] || '').trim();
        }
        results.push(rowObj);
    }
    return results;
}
export function importEmployees(buffer) {
    const rows = parseSapDynamicFile(buffer);
    const stmt = database.prepare(`
    INSERT INTO employees (
      empno, emp_type, first_name, last_name, full_name, designation, dob, gender,
      qualification, pre_exp, telephone1, telephone2, job_profile, joining_date,
      email, street, street2, street3, city, state, ctr, postal_code, doc_sub,
      resig_date, resig_reason, aadhar_no, pan_no, bank_ac, bank_name, prev_esi,
      prev_pf, curr_esi, current_pf, age, community, religion, caste, marital_status,
      pf_applicable, esi_applicable, created_by, created_on
    ) VALUES (
      @empno, @emp_type, @first_name, @last_name, @full_name, @designation, @dob, @gender,
      @qualification, @pre_exp, @telephone1, @telephone2, @job_profile, @joining_date,
      @email, @street, @street2, @street3, @city, @state, @ctr, @postal_code, @doc_sub,
      @resig_date, @resig_reason, @aadhar_no, @pan_no, @bank_ac, @bank_name, @prev_esi,
      @prev_pf, @curr_esi, @current_pf, @age, @community, @religion, @caste, @marital_status,
      @pf_applicable, @esi_applicable, @created_by, @created_on
    )
    ON CONFLICT(empno) DO UPDATE SET
      emp_type = excluded.emp_type,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      full_name = excluded.full_name,
      designation = excluded.designation,
      joining_date = excluded.joining_date,
      resig_date = excluded.resig_date,
      pf_applicable = excluded.pf_applicable,
      esi_applicable = excluded.esi_applicable
  `);
    let count = 0;
    const runTransaction = database.transaction(() => {
        for (const row of rows) {
            const empno = row['Emp No'];
            if (!empno)
                continue;
            stmt.run({
                empno,
                emp_type: row['Emp.type'] || null,
                first_name: row['First name'] || null,
                last_name: row['Last name'] || null,
                full_name: row['Full Name'] || null,
                designation: row['Designation'] || null,
                dob: row['DOB'] || null,
                gender: row['Gender'] || null,
                qualification: row['Qualif.'] || null,
                pre_exp: row['Pre.Exp.'] || null,
                telephone1: row['Telephone1'] || null,
                telephone2: row['Telephone2'] || null,
                job_profile: row['Job Profile'] || null,
                joining_date: parseDate(row['Join.Date']),
                email: row['E-Mail'] || null,
                street: row['Street'] || null,
                street2: row['Street 2'] || null,
                street3: row['Street 3'] || null,
                city: row['City'] || null,
                state: row['State'] || null,
                ctr: row['Ctr'] || null,
                postal_code: row['Postl Code'] || null,
                doc_sub: row['Doc.Sub'] || null,
                resig_date: parseDate(row['Resig.Date']),
                resig_reason: row['Resig.Reas'] || null,
                aadhar_no: row['Aadhar No.'] || null,
                pan_no: row['Pan No'] || null,
                bank_ac: row['Bank A/c'] || null,
                bank_name: row['Bank Name'] || null,
                prev_esi: row['Prev.ESI'] || null,
                prev_pf: row['Prev.PF'] || null,
                curr_esi: row['Curr.ESI'] || null,
                current_pf: row['Current PF'] || null,
                age: row['Age'] || null,
                community: row['Community'] || null,
                religion: row['Religion'] || null,
                caste: row['Caste'] || null,
                marital_status: row['Maritial Status'] || null, // intentional typo
                pf_applicable: (row['Pf appl.'] || '').trim().toUpperCase() === 'X' ? 1 : 0,
                esi_applicable: (row['Esi App.'] || '').trim().toUpperCase() === 'X' ? 1 : 0,
                created_by: row['Created by'] || null,
                created_on: row['Created on'] || null,
            });
            count++;
        }
    });
    runTransaction();
    return count;
}
export function importSalaries(buffer) {
    const rows = parseSapDynamicFile(buffer);
    const stmt = database.prepare(`
    INSERT INTO salaries (
      empno, valid_from, valid_to, basic, da, hra, conveyance, special_allowance
    ) VALUES (
      @empno, @valid_from, @valid_to, @basic, @da, @hra, @conveyance, @special_allowance
    )
  `);
    let count = 0;
    const runTransaction = database.transaction(() => {
        for (const row of rows) {
            const empno = row['Emp No'];
            if (!empno)
                continue;
            stmt.run({
                empno,
                valid_from: parseDate(row['Valid From']),
                valid_to: parseDate(row['Valid To']),
                basic: toDecimal(row['Basic']).toNumber(),
                da: toDecimal(row['DA']).toNumber(),
                hra: toDecimal(row['HRA']).toNumber(),
                conveyance: toDecimal(row['Conveyance']).toNumber(),
                special_allowance: toDecimal(row['Sp.Allowan']).toNumber(),
            });
            count++;
        }
    });
    runTransaction();
    return count;
}
//# sourceMappingURL=parser.js.map