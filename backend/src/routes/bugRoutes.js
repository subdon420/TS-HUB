import express from 'express';
import { 
  getBugs, 
  getBugById, 
  createBug, 
  updateBugStatus, 
  claimBug, 
  addComment, 
  attachFiles 
} from '../controllers/bugController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getBugs);
router.get('/:id', getBugById);
router.post('/', createBug);
router.patch('/:id/status', updateBugStatus);
router.patch('/:id/claim', claimBug);
router.post('/:id/comments', addComment);
router.post('/:id/attachments', upload.array('files', 5), attachFiles);

export default router;

