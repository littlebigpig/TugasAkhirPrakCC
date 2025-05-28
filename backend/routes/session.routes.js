import express from 'express';
import SessionController from '../controllers/session.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import checkAdmin from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(verifyToken);

// Create
router.post('/', SessionController.startSession); 

// Read
router.get('/:id', verifyToken, SessionController.getSessionById); 

// Update
router.patch('/:id', checkAdmin, SessionController.updateSession); 

// Delete
router.delete('/:id', checkAdmin, SessionController.deleteSession); 

export default router;
