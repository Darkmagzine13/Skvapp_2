import PdfPrinter from 'pdfmake';
import { database } from './db.js';
import Decimal from 'decimal.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const fonts = {
    Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
};
const printer = new PdfPrinter(fonts);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
function getHeaderImage() {
    const imagePath = path.join(__dirname, '../../static/payslip_header.png');
    if (fs.existsSync(imagePath)) {
        const base64 = fs.readFileSync(imagePath).toString('base64');
        return `data:image/png;base64,${base64}`;
    }
    return null;
}
export function buildPayslipPdf(results, run) {
    return new Promise((resolve, reject) => {
        const headerImage = getHeaderImage();
        const content = [];
        const monthName = new Date(run.payroll_year, run.payroll_month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const daysInMonth = new Date(run.payroll_year, run.payroll_month, 0).getDate();
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const employee = database.prepare("SELECT designation FROM employees WHERE empno = ?").get(result.empno);
            const designation = employee ? employee.designation : '';
            if (headerImage) {
                content.push({ image: headerImage, width: 500, alignment: 'center', margin: [0, 0, 0, 20] });
            }
            else {
                content.push({ text: 'SHRI KHONGURUNATHAR VIDYALAYAM', alignment: 'center', bold: true, fontSize: 16, margin: [0, 0, 0, 20] });
            }
            content.push({ text: 'PAYSLIP', alignment: 'center', bold: true, fontSize: 14, margin: [0, 0, 0, 20] });
            content.push({
                table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    body: [
                        ['Name:', { text: result.full_name, bold: true }, 'Pay Period:', { text: monthName, bold: true }],
                        ['Designation:', { text: designation, bold: true }, 'No. of Days:', { text: daysInMonth.toString(), bold: true }],
                        ['Employee ID:', { text: result.empno, bold: true }, 'Leave Days:', { text: result.leave_days.toString(), bold: true }]
                    ]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 20]
            });
            const leaveDeduction = new Decimal(result.total_deduction).minus(result.pf).minus(result.esi).toNumber();
            content.push({
                table: {
                    headerRows: 1,
                    widths: ['35%', '15%', '35%', '15%'],
                    body: [
                        [{ text: 'Earnings', bold: true, fillColor: '#eeeeee' }, { text: 'Amount', bold: true, fillColor: '#eeeeee', alignment: 'right' }, { text: 'Deductions', bold: true, fillColor: '#eeeeee' }, { text: 'Amount', bold: true, fillColor: '#eeeeee', alignment: 'right' }],
                        ['Basic Salary', { text: Math.round(result.basic).toString(), alignment: 'right' }, 'PF', { text: Math.round(result.pf).toString(), alignment: 'right' }],
                        ['Dearness Allowance', { text: Math.round(result.da).toString(), alignment: 'right' }, 'ESI', { text: Math.round(result.esi).toString(), alignment: 'right' }],
                        ['House Rent Allowance', { text: Math.round(result.hra).toString(), alignment: 'right' }, 'Leave Deduction', { text: Math.round(leaveDeduction).toString(), alignment: 'right' }],
                        ['Special Allowance', { text: Math.round(result.special_allowance).toString(), alignment: 'right' }, '', ''],
                        ['Conveyance', { text: Math.round(result.conveyance).toString(), alignment: 'right' }, '', ''],
                        [{ text: 'Total Earnings', bold: true }, { text: Math.round(result.gross).toString(), bold: true, alignment: 'right' }, { text: 'Total Deductions', bold: true }, { text: Math.round(result.total_deduction).toString(), bold: true, alignment: 'right' }]
                    ]
                },
                margin: [0, 0, 0, 20]
            });
            content.push({
                text: `Net Salary: Rs. ${Math.round(result.net_salary)}`,
                bold: true,
                fontSize: 14,
                margin: [0, 10, 0, 0],
                alignment: 'right'
            });
            if (i < results.length - 1) {
                content.push({ text: '', pageBreak: 'after' });
            }
        }
        const docDefinition = {
            content: content,
            defaultStyle: {
                font: 'Roboto',
                fontSize: 10
            }
        };
        const doc = printer.createPdfKitDocument(docDefinition);
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        doc.end();
    });
}
//# sourceMappingURL=pdf.js.map