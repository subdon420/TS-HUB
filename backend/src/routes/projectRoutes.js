import express from 'express';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  archiveProject,
  getProjectActivities,
  getAllActivities
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.get('/activities/feed', getAllActivities);
router.get('/:id', getProjectById);
router.get('/:id/activities', getProjectActivities);
router.post('/', createProject);
router.put('/:id', updateProject);
router.patch('/:id/archive', archiveProject);

export default router;

