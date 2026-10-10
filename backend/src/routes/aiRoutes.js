import express from 'express';
import { polishBugReport } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/polish-report', polishBugReport);

export default router;

