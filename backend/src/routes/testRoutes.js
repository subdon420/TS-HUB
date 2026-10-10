import express from 'express';
import { 
  getSuites, 
  createSuite, 
  createTestCase, 
  updateTestCase 
} from '../controllers/testSuiteController.js';
import { 
  getRuns, 
  getRunById,
  startRun, 
  recordCaseResult 
} from '../controllers/testRunController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Test Suites & Cases
router.get('/suites', getSuites);
router.post('/suites', createSuite);
router.post('/cases', createTestCase);
router.put('/cases/:id', updateTestCase);

// Test Runs
router.get('/runs', getRuns);
router.get('/runs/:id', getRunById);
router.post('/runs', startRun);
router.post('/runs/:runId/record', recordCaseResult);

export default router;

