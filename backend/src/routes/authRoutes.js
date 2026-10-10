import express from 'express';
import { register, login, getMe, switchRole, getWorkspaceUsers } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/switch-role', protect, switchRole);
router.get('/workspace/users', protect, getWorkspaceUsers);

export default router;

