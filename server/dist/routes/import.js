import { Router } from 'express';
import multer from 'multer';
import { importEmployees, importSalaries } from '../parser.js';
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.post('/employees', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const count = await importEmployees(req.file.buffer);
        res.json({ imported: count });
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Error importing employees' });
    }
});
router.post('/salaries', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const count = await importSalaries(req.file.buffer);
        res.json({ imported: count });
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Error importing salaries' });
    }
});
export default router;
//# sourceMappingURL=import.js.map