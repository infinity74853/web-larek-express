import { Router } from 'express';
import auth from '../middlewares/auth';
import uploadFile from '../controllers/uploadController';

const router = Router();

router.post('/', auth, uploadFile);

export default router;
