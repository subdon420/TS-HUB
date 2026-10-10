import express from 'express';
import { handleGitWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Git Webhook endpoint (can be triggered by GitHub webhook or by the frontend simulation button)
router.post('/git', handleGitWebhook);

export default router;

