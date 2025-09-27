import { Router } from 'express';
import { createPin, getAllPins } from '../controllers/pinController';

const router = Router();

router.post('/pins', createPin);
router.get('/pins', getAllPins);

export default router;
