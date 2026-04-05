import { Router, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { validate } from '../utils/validator';
import { registerSchema, loginSchema } from '../utils/validator';

const router = Router();

router.post('/register', async (req: any, res: Response, next: NextFunction) => {
  try {
    const data = validate(registerSchema, req.body);
    const result = await authService.register(data);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req: any, res: Response, next: NextFunction) => {
  try {
    const data = validate(loginSchema, req.body);
    const result = await authService.login(data);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/profile', authenticate, async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
