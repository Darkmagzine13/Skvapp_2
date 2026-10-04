import ExcelJS from 'exceljs';
export async function buildExcelExport(results, run, designationMap) {
    const workbook = new ExcelJS.Workbook();
    const mm = run.payroll_month.toString().padStart(2, '0');
    const yyyy = run.payroll_year;
    const worksheet = workbook.addWorksheet(`${mm}-${yyyy}`);
    worksheet.columns = [
        { header: 'Designation', key: 'designation', width: 22 },
        { header: 'Employee ID', key: 'empno', width: 16 },
        { header: 'Employee Name', key: 'full_name', width: 28 },
        { header: 'Basic Salary', key: 'basic', width: 15 },
        { header: 'DA', key: 'da', width: 12 },
        { header: 'HRA(+)', key: 'hra', width: 12 },
        { header: 'Special Allowance(+)', key: 'special_allowance', width: 22 },
        { header: 'Conveyance(+)', key: 'conveyance', width: 17 },
        { header: 'Leave Days', key: 'leave_days', width: 12 },
        { header: 'Gross', key: 'gross', width: 14 },
        { header: 'PF', key: 'pf', width: 12 },
        { header: 'ESI', key: 'esi', width: 12 },
        { header: 'Total Deduction', key: 'total_deduction', width: 18 },
        { header: 'Net Salary', key: 'net_salary', width: 15 },
        { header: 'Month', key: 'month', width: 14 },
        { header: 'No. of Days', key: 'days', width: 14 }
    ];
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9EAF7' }
        };
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });
    const getDaysInMonth = (month, year) => {
        if (month === 2) {
            return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28;
        }
        if ([4, 6, 9, 11].includes(month)) {
            return 30;
        }
        return 31;
    };
    const daysInMonth = getDaysInMonth(run.payroll_month, run.payroll_year);
    const monthStr = `${mm}/${yyyy}`;
    for (const result of results) {
        worksheet.addRow({
            designation: designationMap.get(result.empno) || '',
            empno: result.empno,
            full_name: result.full_name,
            basic: result.basic,
            da: result.da,
            hra: result.hra,
            special_allowance: result.special_allowance,
            conveyance: result.conveyance,
            leave_days: result.leave_days,
            gross: result.gross,
            pf: result.pf,
            esi: result.esi,
            total_deduction: result.total_deduction,
            net_salary: result.net_salary,
            month: monthStr,
            days: daysInMonth
        });
    }
    const lastDataRow = results.length + 1;
    const subtotalRow = worksheet.addRow({
        designation: 'SUBTOTAL',
        empno: '',
        full_name: '',
        leave_days: ''
    });
    const subtotalRowNumber = lastDataRow + 1;
    for (let i = 4; i <= 14; i++) {
        if (i === 9)
            continue; // leave_days column (I)
        const colLetter = worksheet.getColumn(i).letter;
        subtotalRow.getCell(i).value = { formula: `SUM(${colLetter}2:${colLetter}${lastDataRow})`, date1904: false };
    }
    subtotalRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF2CC' }
        };
    });
    for (let i = 2; i <= subtotalRowNumber; i++) {
        const row = worksheet.getRow(i);
        for (let j = 4; j <= 14; j++) {
            row.getCell(j).numFmt = '#,##0.00';
        }
    }
    worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }
    ];
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}
//# sourceMappingURL=excel.js.map